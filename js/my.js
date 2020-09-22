$(document).ready(function() {
  
  
   // Sliders

 // Category-slider

  $('.category-slider').slick({
    infinite: true,
    slidesToShow: 2,
    slidesToScroll: 1,
    dots: false,
    arrows: true,
    appendArrows: $('.arrow-main--category'),
    prevArrow: '<div class="arrow-btn arrow-btn--prev"></div>',
    nextArrow: '<div class="arrow-btn arrow-btn--next"></div>',
      responsive: [{
        breakpoint: 1000,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      }, {
        breakpoint: 900,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }]
  });
  
  
  
   // Mmenu

  $("#menu").mmenu({
    navbar: {
      title: "Меню"
    }
  });
  
  
  
});