let ellipseX;
let ellipseY;
let ellipseS = 10;
let ellipseMax = 800;
let noiseOffset = 0;
let particles = [];
let numParticles = 50;
let particleLayer;
let particleAugment = 0;

 let bubbleSize;

///////BURST PARTICLES////
let burstParticleLayer;
let burstParticles = []; // New array for burst particles
let burstTriggered = false; // Flag to check if the burst is triggered
let numBurstParticles = 50; // Number of particles in the burst
let burstColor = [330, 100, 100]; // Pink color (HSB format)


////SLIDERS///////
let volumeSlider;
let paloLluvSlider;  // New slider for paloLluv volume

let baseVolume = 0.5;
let paloLluvVolume = 0.5;
let baseSliderX, paloSliderX;
let sliderHeight = 60;
let sliderWidth = 100;

 let paloSliderXPos;
 let totalSliderWidth;
 let centerX;
let gap = 200; // Define the gap between the sliders

////////SOUNDS/////
let basicFreq;
let paloLluv;

let isMuted = false; // Track mute state

///////HARMONICS/////

let selectedHarmonic;

let pitch1, harmonic1, harmonic2, harmonic3;
let ptch2, harmonic4, harmonic5, harmonic6;
let pitch3, harmonic7, harmonic8, harmonic9;

////////FREQUENCY PITCH //////
let fft;
let particleColor;
let particleSpeed = 1;



/////////PRELOAD///////

function preload() {
  basicFreq = loadSound("healing-frequencies.mp3");
  paloLluv = loadSound("Palo de lluvia.mp3");
  pitch1 = loadSound("violin-bell.mp3");

  // Create copies of pitch1 for harmonics
  harmonic1 = loadSound("violin-bell.mp3");
  harmonic2 = loadSound("violin-bell.mp3");
  harmonic3 = loadSound("violin-bell.mp3");
  
  pitch2 = loadSound("tranquil_01.mp3");
  
  harmonic4 = loadSound("tranquil_01.mp3");
  harmonic5 = loadSound("tranquil_01.mp3");
  harmonic6 = loadSound("tranquil_01.mp3");
  
  pitch3 = loadSound("singing-bowl.mp3");
  
  harmonic7 = loadSound("singing-bowl.mp3");
  harmonic8 = loadSound("singing-bowl.mp3");
  harmonic9 = loadSound("singing-bowl.mp3");

}


/////////SETUP//////////

function setup() {
  fft = new p5.FFT();
  
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);

  ellipseX = width / 2;
  ellipseY = height / 2;

  particleLayer = createGraphics(width, height);
  particleLayer.colorMode(HSB, 360, 100, 100, 100);

  // Initialize burstParticleLayer inside setup()
  burstParticleLayer = createGraphics(width, height);  // This is where the initialization happens
  burstParticleLayer.colorMode(HSB, 360, 100, 100, 100);

  for (let i = 0; i < numParticles; i++) {
    particles.push(new Particle());
  }
  
  //noCursor();

  
}




////////////FUNCTION DRAW///////////

function draw() {
  background(0, 0, 0, 10);

  let noiseValue = noise(noiseOffset);
  let bubbleSize = ellipseS + (ellipseMax - ellipseS) * noiseValue; //////UDATED VARIABLE NAME CUZ SIZE IS NOT POSSIBLE

  noiseOffset += 0.01;

  noStroke();
  fill(0, 0, 0, 1);
  ellipse(ellipseX, ellipseY, bubbleSize);

  particleLayer.clear();

  for (let particle of particles) {
    particle.update(bubbleSize);
    particle.display(particleLayer);
  }

  particleLayer.filter(BLUR, 15);
  image(particleLayer, 0, 0);

  // Update sound volumes based on slider values
  basicFreq.setVolume(baseVolume);
  paloLluv.setVolume(paloLluvVolume);

  
  // Draw custom slider UI
  drawSliderUI();
}

//////SLIDER//////
function drawSliderUI() {
  centerX = windowWidth / 2; // Calculate the center of the window
  totalSliderWidth = sliderWidth * 2 + 80; // Width of both sliders plus gap

  // Calculate starting X position for sliders (centered)
  let baseSliderXPos = centerX - totalSliderWidth / 2; // Position for the Base slider
  paloSliderXPos = baseSliderXPos + sliderWidth + gap; // Position for the Palo de Lluvia slider

  fill(0, 80);
  stroke(0);
  strokeWeight(2);
  rect(0, 0, width, sliderHeight);  // Background for the sliders

  // Base Frequency Slider
  stroke(150);
  strokeWeight(3);
  line(baseSliderXPos, 30, baseSliderXPos + sliderWidth, 30);  // Horizontal line for Base Frequency Slider

  // Handle base volume slider dragging
  if (mouseIsPressed && mouseY > 20 && mouseY < 40 && mouseX > baseSliderXPos && mouseX < baseSliderXPos + sliderWidth) {
    baseSliderX = constrain(mouseX, baseSliderXPos, baseSliderXPos + sliderWidth);  // Constrain the slider position
    baseVolume = map(baseSliderX, baseSliderXPos, baseSliderXPos + sliderWidth, 0, 1);  // Update volume based on slider position
  }

  strokeWeight(4);
  line(baseSliderX, 20, baseSliderX, 40);  // Movable vertical line for Base Frequency

  fill(67,15,93);
  textSize(20);
  noStroke();
  text("Dawn", baseSliderXPos - 60, 35);  // Label for Base Frequency

  // Palo de Lluvia Slider
  stroke(150);
  strokeWeight(3);
  line(paloSliderXPos, 30, paloSliderXPos + sliderWidth, 30);  // Horizontal line for Palo de Lluvia Slider

  // Handle Palo de Lluvia volume slider dragging
  if (mouseIsPressed && mouseY > 20 && mouseY < 40 && mouseX > paloSliderXPos && mouseX < paloSliderXPos + sliderWidth) {
    paloSliderX = constrain(mouseX, paloSliderXPos, paloSliderXPos + sliderWidth);  // Constrain the slider position
    paloLluvVolume = map(paloSliderX, paloSliderXPos, paloSliderXPos + sliderWidth, 0, 1);  // Update volume based on slider position
  }

  line(paloSliderX, 20, paloSliderX, 40);  // Movable vertical line for Palo de Lluvia

  fill(67,15,93);
  textSize(20);
  noStroke();
  text("Falling rain", paloSliderXPos - 110, 35);  // Label for Palo de Lluvia
}


///////////////////////MAIN PARTICLES CLASS

class Particle {
  constructor() {
    this.angle = random(TWO_PI);
    this.radius = random(0, 500);
    this.speed = random(0.5, 250);
    this.color = color(random([320, 200, 0]), 73, 96);
  }

  update(maxSize) {
    this.radius += this.speed * 0.02;
    if (this.radius > maxSize / 2) {
      this.radius = 0;
    }
    this.angle += random(0.01, 0.005);
  }

  display(graphicsLayer) {
    let x = ellipseX + this.radius * cos(this.angle);
    let y = ellipseY + this.radius * sin(this.angle);

 for (let i = 0; i < 3; i++) {
  let haloSize = 10 + i * 6 + particleAugment;
  let alphaValue = map(i, 0, 3, 100, 255); // Gradual fade effect
  graphicsLayer.noStroke();
  graphicsLayer.fill(this.color.levels[0], this.color.levels[1], this.color.levels[0], alphaValue);
  graphicsLayer.ellipse(x, y, haloSize);
}

graphicsLayer.noStroke();
graphicsLayer.fill(this.color.levels[0], this.color.levels[1], this.color.levels[2], 150);
graphicsLayer.ellipse(x, y, 40 + particleAugment);
  }
}

///////////// BURST PARTICLES CLASS
class BurstParticle {
  constructor() {
    this.angle = random(TWO_PI); // Random direction
    this.radius = 0; // Start at the center
    this.speed = random(5, 400); // Faster speed for more dramatic effect
    this.color = color(330, 100,100); // Keep pink but increase brightness range
    this.size = random(20, 300); // Bigger size variation
    this.lifetime = random(150, 250); // Longer lifetime
    this.age = 0; // Particle age for fading
    this.expanding = true; // Control whether the particle expands or contracts
  }

  update() {
    if (this.expanding) {
      this.radius += this.speed; // Move outward
    } else {
      this.radius -= this.speed * 0.5; // Slowly contract
    }

    this.age++;

    if (this.age > this.lifetime / 2) {
      this.expanding = false; // Start collapsing after half lifetime
    }

    if (this.radius <= 0) {
      this.age = 0;
      this.radius = 0;
      this.expanding = true; // Reset for a new burst cycle
    }
  }

  display(graphicsLayer) {
    let x = ellipseX + this.radius * cos(this.angle);
    let y = ellipseY + this.radius * sin(this.angle);

    let alphaValue = map(this.age, 0, this.lifetime, 255, 0); // Smooth fading
    graphicsLayer.noStroke();

    // Glow Effect - Layered Transparency
    for (let i = 0; i < 3; i++) {
      let glowSize = this.size + i * 20; // Expanding glow rings
      let glowAlpha = alphaValue * (1 - i * 0.3); // Decreasing alpha for outer layers
      graphicsLayer.fill(this.color.levels[0], this.color.levels[1], this.color.levels[2], glowAlpha);
      graphicsLayer.ellipse(x, y, glowSize);
    }

    // Core Particle
    graphicsLayer.fill(this.color.levels[0], this.color.levels[1], this.color.levels[2], alphaValue);
    graphicsLayer.ellipse(x, y, this.size);
  }
}



///////HARMONIC SOUNDS//////

////PITCH1 HARMONICS
function playRandomHarmonic() {
  // Debugging: Check if sounds are loaded
  if (!pitch1.isLoaded() || !harmonic1.isLoaded() || !harmonic2.isLoaded() || !harmonic3.isLoaded()) {
    console.error("Sounds are not loaded yet!");
    return;
  }

  try {
    // Stop any currently playing sound
    if (pitch1.isPlaying()) pitch1.stop();
    if (harmonic1.isPlaying()) harmonic1.stop();
    if (harmonic2.isPlaying()) harmonic2.stop();
    if (harmonic3.isPlaying()) harmonic3.stop();

    console.log("Playing main pitch...");

    // Play the original pitch
    pitch1.rate(1.0);
    pitch1.play();

    // Choose a random harmonic
    let harmonics = [
      { sound: harmonic1, rate: 1.5, name: "Perfect Fifth" }, 
      { sound: harmonic2, rate: 2.0, name: "Octave" }, 
      { sound: harmonic3, rate: 1.25, name: "Major Third" }
    ];

    // Assign selectedHarmonic globally
    selectedHarmonic = random(harmonics);
    selectedHarmonic.sound.rate(selectedHarmonic.rate);

    setTimeout(() => {
      console.log(`Playing harmonic: ${selectedHarmonic.name}`);
      selectedHarmonic.sound.play();
    }, 200); // Slight delay after main pitch
  } catch (error) {
    console.error("Error playing sounds:", error);
  }

  // Only update particle behavior if selectedHarmonic is defined
  if (selectedHarmonic) {
    ////////FFT BEHAVIOUR
    if (selectedHarmonic.name === "Perfect Fifth") {
      particleAugment = 20;  // Increase particle size or speed for this harmonic
    } else if (selectedHarmonic.name === "Octave") {
      particleAugment = 0;  // Reset particle behavior
    }

    // Frequency-based particle behavior
    let spectrum = fft.analyze();  // Get the frequency spectrum

    // Get the frequency value of the sound
    let bass = fft.getEnergy("bass");  // Low frequencies (bass)
    let treble = fft.getEnergy("treble");  // High frequencies (treble)

    // If the sound is more bass-heavy (low pitch)
    if (bass > treble) {
      particleAugment = 10; // Particle behavior for low pitch (bass)
      particleColor = color(240, 100, 100); // Change color to something cooler for bass
      particleSpeed = 2;  // Slow down the particles for bass-heavy sound
      console.log("Low pitch detected, adjusting particle behavior...");
    } 
    // If the sound is more treble-heavy (high pitch)
    else if (treble > bass) {
      particleAugment = 30; // Particle behavior for high pitch (treble)
      particleColor = color(60, 100, 100); // Change color to something warmer for treble
      particleSpeed = 5;  // Speed up the particles for treble-heavy sound
      console.log("High pitch detected, adjusting particle behavior...");
    }
  } else {
    console.error("selectedHarmonic is undefined!");
  }
}


///// PITCH2 HARMONICS
function playRandomHarmonic2() {
  if (!pitch2 || !harmonic4 || !harmonic5 || !harmonic6) {
    console.error("Error: Harmonic sounds are not defined!");
    return;
  }
  
  if (!pitch2.isLoaded() || !harmonic4.isLoaded() || !harmonic5.isLoaded() || !harmonic6.isLoaded()) {
    console.error("Sounds for pitch2 are not loaded yet!");
    return;
  }

  try {
    if (pitch2.isPlaying()) pitch2.stop();
    if (harmonic4.isPlaying()) harmonic4.stop();
    if (harmonic5.isPlaying()) harmonic5.stop();
    if (harmonic6.isPlaying()) harmonic6.stop();

    console.log("Playing main pitch2...");

    pitch2.rate(1.0);
    pitch2.play();

    let harmonics = [
      { sound: harmonic4, rate: 1.33, name: "Perfect Fourth" }, 
      { sound: harmonic5, rate: 1.75, name: "Minor Seventh" }, 
      { sound: harmonic6, rate: 2.25, name: "Major Ninth" }
    ];
    
    let selectedHarmonic = random(harmonics);
    selectedHarmonic.sound.rate(selectedHarmonic.rate);

    setTimeout(() => {
      console.log(`Playing harmonic: ${selectedHarmonic.name}`);
      selectedHarmonic.sound.play();
    }, 150);
  } catch (error) {
    console.error("Error playing pitch2 harmonics:", error);
  }
}

//// PITCH3 HARMONICS
function playRandomHarmonic3() {
  if (!pitch3 || !harmonic7 || !harmonic8 || !harmonic9) {
    console.error("Error: Harmonic sounds are not defined!");
    return;
  }
  
  if (!pitch3.isLoaded() || !harmonic7.isLoaded() || !harmonic8.isLoaded() || !harmonic9.isLoaded()) {
    console.error("Sounds for pitch3 are not loaded yet!");
    return;
  }

  try {
    if (pitch3.isPlaying()) pitch3.stop();
    if (harmonic7.isPlaying()) harmonic7.stop();
    if (harmonic8.isPlaying()) harmonic8.stop();
    if (harmonic9.isPlaying()) harmonic9.stop();

    console.log("Playing main pitch3...");

    pitch2.rate(1.0);
    pitch2.play();

    let harmonics = [
      { sound: harmonic7, rate: 1.33, name: "Perfect Fourth" }, 
      { sound: harmonic8, rate: 1.75, name: "Minor Seventh" }, 
      { sound: harmonic9, rate: 2.25, name: "Major Ninth" }
    ];
    
    let selectedHarmonic = random(harmonics);
    selectedHarmonic.sound.rate(selectedHarmonic.rate);

    setTimeout(() => {
      console.log(`Playing harmonic: ${selectedHarmonic.name}`);
      selectedHarmonic.sound.play();
    }, 150);
  } catch (error) {
    console.error("Error playing pitch3 harmonics:", error);
  }
}

///////////DRAW BUSRT PARTICLES///////

function drawBurstParticles() {
  burstParticleLayer.clear(); // Clear the previous frame
  if (burstTriggered) {
    // Create new burst particles if a burst was triggered
    for (let particle of burstParticles) {
      particle.update();
      particle.display(burstParticleLayer); // Display burst particle on the layer
    }
    // Draw the burst particle layer to the canvas
    image(burstParticleLayer, 50, 0); 
  }
}

//////////////KEYPRESSED FUNCTION////////////

function keyPressed() {
 console.log("Key pressed: Checking for random burst...");

  // Randomly decide whether to trigger the burst (e.g., 50% chance)
  if (random(1) < 0.5) { 
    console.log("Random burst triggered!");
    burstParticles = []; // Clear previous burst particles
    for (let i = 0; i < numBurstParticles; i++) {
      burstParticles.push(new BurstParticle()); // Create new burst particles
    }
    burstTriggered = true; // Mark that a burst is triggered
  }

  
  
  if (key === 'a' || key === 'A' || key === 'g' || key === 'G'|| key === 'l' || key === 'L') {
    console.log("Key 'A' pressed: Playing pitch1 random harmonic...");
    playRandomHarmonic();
  }

  if (key === 's' || key === 'S' || key === 'f' || key === 'F' || key === 'k' || key === 'K') {
    console.log("Key 'S' or 'F' or 'K' pressed: Playing pitch2 random harmonic...");
    playRandomHarmonic2();
  }

  if (key === 'd' || key === 'D'|| key === 'h' || key === 'H' || key === 'j' || key === 'J') {
    console.log("Key 'D' or 'H' or 'J' pressed: Playing pitch3 random harmonic...");
    playRandomHarmonic3();
  }
}




//////MOUSE PRESSED/////////
function mousePressed() {
  if (!basicFreq.isPlaying()) {
    basicFreq.loop();
  }
  if (!paloLluv.isPlaying()) {
    paloLluv.loop(); // Start playing Palo Lluv when mouse is pressed
  }
}


////////OVERLAY 1

document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("overlay");
  const overlayText = document.getElementById("overlayText");

  setTimeout(() => {
    overlayText.textContent = "Click anywhere to start"; // Change text after first fade-out
  }, 3000); // Adjust timing to match animation

  overlay.addEventListener("click", () => {
    overlay.classList.add("hidden"); // Hide overlay on click
  });
});


////////MUTE-UNMUTE
document.addEventListener("DOMContentLoaded", () => {
  const muteButton = document.getElementById("muteButton");
  let isMuted = false;

  muteButton.addEventListener("click", () => {
    isMuted = !isMuted;
    muteButton.textContent = isMuted ? "Unmute" : "Mute";

    // Mute/unmute all sounds
    document.querySelectorAll("audio, video").forEach((media) => {
      media.muted = isMuted;
    });
  });
});

function toggleMute() {
  isMuted = !isMuted; // Toggle mute state

  if (isMuted) {
    basicFreq.stop();
    paloLluv.stop();
  } else {
    if (!basicFreq.isPlaying()) basicFreq.loop();
    if (!paloLluv.isPlaying()) paloLluv.loop();
  }
}

document.getElementById("muteButton").addEventListener("click", toggleMute);



