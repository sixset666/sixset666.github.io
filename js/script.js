let currentStep = 1;

function nextCard() {
  const currentCard = document.getElementById(`card-${currentStep}`);
  const nextCard = document.getElementById(`card-${currentStep + 1}`);
  const nextCard2 = document.getElementById(`card-${currentStep + 2}`);
  const previousCard = document.getElementById(`card-${currentStep - 1}`);
  const dots = document.querySelectorAll('.dot');

  currentStep++;

  dots.forEach(dot => dot.classList.remove('active-dot'));

  if (currentCard) {
    currentCard.classList.remove('principal');
    currentCard.classList.add('anterior');
  }

  if (nextCard) {
    const nextCardDots = nextCard.querySelectorAll('.dot');
    if (nextCardDots.length > currentStep - 1) {
      nextCardDots[currentStep - 1].classList.add('active-dot');
    }
    nextCard.classList.remove('siguiente');
    nextCard.classList.add('principal');
  }

  if (nextCard2) {
    nextCard2.classList.remove('siguiente2');
    nextCard2.classList.add('siguiente');
  }

  if (previousCard) {
    previousCard.classList.remove('anterior');
    previousCard.classList.add('anterior2');
    document.getElementById('div-transparent-next')?.classList.add('ocultar');
  }
  document.getElementById('div-transparent-previous')?.classList.remove('ocultar');
}

function previousCard() {
  const currentCard = document.getElementById(`card-${currentStep}`);
  const nextCard = document.getElementById(`card-${currentStep + 1}`);
  const previousCard = document.getElementById(`card-${currentStep - 1}`);
  const previousCard2 = document.getElementById(`card-${currentStep - 2}`);
  const dots = document.querySelectorAll('.dot');

  currentStep--;

  dots.forEach(dot => dot.classList.remove('active-dot'));

  if (currentCard) {
    currentCard.classList.remove('principal');
    currentCard.classList.add('siguiente');
  }

  if (previousCard) {
    const previousCardDots = previousCard.querySelectorAll('.dot');
    if (previousCardDots.length > currentStep - 1) {
      previousCardDots[currentStep - 1].classList.add('active-dot');
    }
    previousCard.classList.remove('anterior');
    previousCard.classList.add('principal');
  }

  if (previousCard2) {
    previousCard2.classList.remove('anterior2');
    previousCard2.classList.add('anterior');
  }

  if (nextCard) {
    nextCard.classList.remove('siguiente');
    nextCard.classList.add('siguiente2');
    document.getElementById('div-transparent-previous')?.classList.add('ocultar');
  }
  document.getElementById('div-transparent-next')?.classList.remove('ocultar');
}

//funcionalidad de arrastrar card para movil:

let touchStartX = 0;

function onTouchStart(event) {
  touchStartX = event.changedTouches[0].clientX;
}

function onTouchEnd(event) {
  const touchEndX = event.changedTouches[0].clientX;
  const deltaX = touchStartX - touchEndX;
  const nextCardElement = document.getElementById(`card-${currentStep + 1}`);
  const previousCardElement = document.getElementById(`card-${currentStep - 1}`);

  if (deltaX > 50 && nextCardElement) {
    nextCard();  
  } else if (deltaX < -50 && previousCardElement) {
    previousCard();  
  }
}

const slides = document.querySelectorAll('.slide');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');
const progressBar = document.querySelector('.progress-bar');
let currentSlide = 0;

function updateSlides() {
    slides.forEach(slide => slide.classList.remove('active'));
    slides[currentSlide].classList.add('active');
    
    // Update progress bar
    const progress = ((currentSlide + 1) / slides.length) * 100;
    progressBar.style.width = `${progress}%`;
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    updateSlides();
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    updateSlides();
}

// Event listeners
nextBtn.addEventListener('click', nextSlide);
prevBtn.addEventListener('click', prevSlide);

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === 'ArrowLeft') prevSlide();
});

// Initialize progress bar
updateSlides();


$(document).ready(function(){
  $(".owl-carousel").owlCarousel({
      items:3,
//      autoplay:false,
      margin:30,
      loop:true,
      dots:true
//      nav:true,
//      navText:["<i class='fas fa-long-arrow-alt-left'></i>","<i class='fas fa-long-arrow-alt-right'></i>" ]
  });
});

  /* Click Menu Button */ 
  $('#js_menu_button').on('click', function(){
    if(!$(this).hasClass('on_menu')){
      $('#js_menu_button').addClass('on_menu');
    }else{
      $('#js_menu_button').removeClass('on_menu');    
    }
    return false;
  });

  const slider = document.querySelector(".reviews-slider");
const prevBtn1 = document.getElementById("prevReview");
const nextBtn1 = document.getElementById("nextReview");

let index = 0;
const reviews = document.querySelectorAll(".single-testimonial-item");

function updateSlider() {
  slider.style.transform = `translateX(-${index * 105}%)`;
}

nextBtn1.addEventListener("click", () => {
  if (index < reviews.length - 1) {
    index++;
  } else {
    index = 0; // Зацикливаем слайды
  }
  updateSlider();
});

prevBtn1.addEventListener("click", () => {
  if (index > 0) {
    index--;
  } else {
    index = reviews.length - 1; // Зацикливаем слайды
  }
  updateSlider();
});
