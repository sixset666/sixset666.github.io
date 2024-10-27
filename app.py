import os
from flask import Flask, request, jsonify, render_template
import pandas as pd
import pdfkit
import locale
from datetime import datetime
from babel.dates import format_date
import qrcode
from io import BytesIO
import base64
# Устанавливаем локаль на русский язык
locale.setlocale(locale.LC_TIME, 'ru_RU.UTF-8')
app = Flask(__name__)

# Папка для сохранения PDF-файлов
PDF_FOLDER = 'generated_pdfs'
os.makedirs(PDF_FOLDER, exist_ok=True)

# Настройка pdfkit
path_to_wkhtmltopdf = r'C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe'  # Укажите путь к wkhtmltopdf
config = pdfkit.configuration(wkhtmltopdf=path_to_wkhtmltopdf)

# Функция для генерации QR-кода
def generate_qr_code(payment_data):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    
    qr.add_data(payment_data)
    qr.make(fit=True)

    # Генерация QR-кода в байтовом виде
    img = qr.make_image(fill='black', back_color='white')

    # Сохранение в буфер памяти (не на диск)
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)

    # Конвертируем изображение в base64, чтобы вставить его в HTML
    img_str = base64.b64encode(buffer.getvalue()).decode('utf-8')
    return img_str

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    file = request.files['file']
    if not file:
        return jsonify({'error': 'No file uploaded'})

    try:
        # Читаем все страницы Excel, начиная с 8-й строки
        excel_data = pd.read_excel(file, sheet_name=None, header=7)
        # Читаем файл снова для извлечения направления из ячейки B3
        full_excel_data = pd.read_excel(file, sheet_name=None, header=None)
    except Exception as e:
        return jsonify({'error': f'Error reading Excel file: {str(e)}'})

    receipts = []  # Список для данных квитанций
    pdf_files = []
    total_debt = 0.0
    current_date = datetime.now()
    day = current_date.day
    month = format_date(current_date, format='MMMM', locale='ru')
    correctMonth = str(format_date(current_date, format='MMMM', locale='ru'))
    correctMonthUpper = correctMonth.upper()
    year = current_date.year

    for sheet_name, df in excel_data.items():
        print(f"Обрабатывается лист: {sheet_name}")

        # Чтение направления из B3 на текущем листе
        full_df = full_excel_data[sheet_name]
        direction = str(full_df.iloc[2, 1]).strip()

        # Проверяем наличие нужных столбцов
        if not set(['ФИО участника', 'ФИО родителя', 'Долг']).issubset(df.columns):
            print(f"Пропущен лист {sheet_name}: отсутствуют нужные столбцы.")
            continue

        # Конвертируем столбец 'Долг' в числовой формат и фильтруем по ненулевым значениям
        df['Долг'] = pd.to_numeric(df['Долг'], errors='coerce')
        df = df[df['Долг'] > 0].dropna(subset=['Долг'])

        if df.empty:
            print(f"Пропущен лист {sheet_name}: нет данных о долге.")
            continue

        for index, row in df.iterrows():
            payer_name = str(row.get('ФИО родителя', 'Не указано')).strip()
            participant_name = str(row.get('ФИО участника', 'Не указано')).strip()
            amount = float(row.get('Долг', 0))
            total_debt += amount
            # Генерация строки для QR-кода
            payment_data = f"ST00012|Name=ИП Рева Руслан Сергеевич|PersonalAcc=40802810300000565321|BankName=ООО ОЗОН БАНК|BIC=044525068|CorrespAcc=30101810645374525068|PayeeINN=236800273267|Purpose={participant_name}. {direction} ({correctMonthUpper} {year}). НДС не облагается; {payer_name}|PayerName={payer_name}|Sum={int(amount * 100)}"

            # Генерация QR-кода
            qr_code = generate_qr_code(payment_data)

            # Вывод отладочной информации для каждого участника
            print(f"Создается квитанция для {payer_name}, участник: {participant_name}, направление: {direction}")

            # Рендеринг шаблона для каждого плательщика
            rendered = render_template('invoice_template.html', payer_name=payer_name,
                                    participant_name=participant_name, direction=direction,
                                    amount=f"{amount:.2f}", day=day, month=month, year=year,
                                    qr_code=qr_code)

            # Генерация PDF-файла
            sanitized_filename = participant_name.replace(" ", "_").replace(".", "") + "_" + direction + "_" + str(month) + "_" + str(year)
            pdf_filename = f'{sanitized_filename}.pdf'
            pdf_path = os.path.join(PDF_FOLDER, pdf_filename)

            options = {'quiet': '', 'no-pdf-compression': ''}
            try:
                pdfkit.from_string(rendered, pdf_path, configuration=config, options=options)
            except Exception as e:
                print(f"Ошибка генерации PDF для {sheet_name}: {e}")
                continue

            pdf_files.append(pdf_filename)

            # Добавление данных в receipts
            receipts.append({
                'name': payer_name,
                'participant_name': participant_name,
                'direction': direction,
                'amount': f"{amount:.2f}"
            })

    return jsonify({
        'receipts': receipts,
        'pdf_files': pdf_files,
        'total_debt': f"{total_debt:.2f}" 
    })


if __name__ == '__main__':
    app.run(debug=True)