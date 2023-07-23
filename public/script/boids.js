let flockContainer = {
    flock: [],
    followMouse: false,
    avoidMouse: false,
    totalBoids: 200,
    alignSlider: null,
    cohesionSlider: null,
    separationSlider: null,
    birdCursorImage: null,
    checkboxFollow: null,
    checkboxAvoid: null
  }
  
  function preload() {
    flockContainer.birdCursorImage = loadImage('../public/images/bird-cursor.png');
  }
    
  class Boid {
    maxSpeed = 5;
    maxForce = 0.2;
    alignSeeRadius = 25;
    seperationSeeRadius = 24;
    cohesionSeeRadius = 50;
  
    constructor() {
        this.position = createVector(random(width), random(height));
        this.velocity = p5.Vector.random2D();
        this.velocity.setMag(random(2, 4));
        this.acceleration = createVector();
    }
  
    edgesCases() {
        if (this.position.x > width) {
          this.position.x = 0;
        } else if (this.position.x < 0) {
          this.position.x = width;
        }
        if (this.position.y > height) {
          this.position.y = 0;
        } else if (this.position.y < 0) {
          this.position.y = height;
        }
    }
  
    align(boids) {
      let steering = createVector();
      let total = 0;
      for (let other of boids) {
        let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
        if (other != this && d < this.alignSeeRadius) {
          steering.add(other.velocity);
          total++;
          }
        }
        if (total > 0) {
          steering.div(total);
          steering.setMag(this.maxSpeed);
          steering.sub(this.velocity);
          steering.limit(this.maxForce);
        }
      return steering;
    }
      
    separation(boids) {
      let steering = createVector();
      let total = 0;
      for (let other of boids) {
        let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
        if (other != this && d < this.seperationSeeRadius) {
          let diff = p5.Vector.sub(this.position, other.position);
          diff.div(d * d);
          steering.add(diff);
          total++;
        }
      }
      if (total > 0) {
        steering.div(total);
        steering.setMag(this.maxSpeed);
        steering.sub(this.velocity);
        steering.limit(this.maxForce);
      }
      return steering;
    }
    
    cohesion(boids) {
      let steering = createVector();
      let total = 0;
      for (let other of boids) {
        let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
        if (other != this && d < this.cohesionSeeRadius) {
          steering.add(other.position);
          total++;
        }
      }
      if (total > 0) {
        steering.div(total);
        steering.sub(this.position);
        steering.setMag(this.maxSpeed);
        steering.sub(this.velocity);
        steering.limit(this.maxForce);
      }
      return steering;
    }
  
    update(flock, mouseX, mouseY) {
      this.mouseX = mouseX;
      this.mouseY = mouseY;
      this.edgesCases();
      this.flock(flock);
      this.position.add(this.velocity);
      this.velocity.add(this.acceleration);
      this.velocity.limit(this.maxSpeed);
      this.acceleration.mult(0);
    }
  
    flock(boids) {
        let alignment = this.align(boids);
        let cohesion = this.cohesion(boids);
        let separation = this.separation(boids);
        if (flockContainer.followMouse) {
          let mouse = createVector(this.mouseX, this.mouseY);
          let mouseForce = p5.Vector.sub(mouse, this.position);
          mouseForce.setMag(this.maxSpeed);
          mouseForce.sub(this.velocity);
          mouseForce.limit(this.maxForce);
          this.acceleration.add(mouseForce);
        }
  
        if (flockContainer.avoidMouse) {
          let mouse = createVector(this.mouseX, this.mouseY);
          let mouseForce = p5.Vector.sub(mouse, this.position);
          let distance = mouseForce.mag()
          if (distance < 100) {
            mouseForce.setMag(this.maxSpeed);
            mouseForce.mult(-1);
            let steer = p5.Vector.sub(mouseForce, this.velocity);
            //steer.limit(this.maxForce);
            this.acceleration.add(steer);
          }
        }
  
        alignment.mult(flockContainer.alignSlider.value());
        cohesion.mult(flockContainer.cohesionSlider.value());
        separation.mult(flockContainer.separationSlider.value());
  
        this.acceleration.add(alignment);
        this.acceleration.add(cohesion);
        this.acceleration.add(separation);
    }
  
    show() {
      const heading = this.velocity.heading() + HALF_PI;
      fill(255);
      stroke(255);
      push();
      translate(this.position.x, this.position.y);
      rotate(heading);
      beginShape();
      vertex(0, -6);
      vertex(-3, 3);
      vertex(3, 3);
      endShape(CLOSE);
      pop();
    }
  }
  
  function setup() {
    createCanvas(windowWidth, windowHeight);
  
    flockContainer.alignSlider = createSlider(0, 2, 1.5, 0.1);
    flockContainer.alignSlider.position(windowWidth / 2 - 100, windowHeight - 100);
    flockContainer.alignSlider.style('width', '200px');
  
    flockContainer.cohesionSlider = createSlider(0, 2, 1, 0.1);
    flockContainer.cohesionSlider.position(windowWidth / 2 - 100, windowHeight - 75);
    flockContainer.cohesionSlider.style('width', '200px');
  
    flockContainer.separationSlider = createSlider(0, 2, 2, 0.1);
    flockContainer.separationSlider.position(windowWidth / 2 - 100, windowHeight - 50);
    flockContainer.separationSlider.style('width', '200px');
  
    flockContainer.checkboxFollow = createCheckbox('Follow Mouse', false);
    flockContainer.checkboxFollow.position(windowWidth / 2 + 200, windowHeight - 75);
    flockContainer.checkboxFollow.changed(followMouseEvent);
    flockContainer.checkboxFollow.style('color', 'white');
  
    flockContainer.checkboxAvoid = createCheckbox('Avoid Mouse', false);
    flockContainer.checkboxAvoid.position(windowWidth / 2 - 400, windowHeight - 75);
    flockContainer.checkboxAvoid.changed(avoidMouseEvent);
    flockContainer.checkboxAvoid.style('color', 'white');
  
    for (let i = 0; i < flockContainer.totalBoids; i++) {
      flockContainer.flock.push(new Boid());
    }
    textAlign(CENTER, BOTTOM);
    textSize(15);
  
    select('body').style('cursor', 'none');
  }
  
  function avoidMouseEvent() {
    if (!flockContainer.checkboxAvoid.checked()) {
      flockContainer.checkboxAvoid.checked(false);
      flockContainer.avoidMouse = false;
      return;
    }
    flockContainer.followMouse = false;
    flockContainer.avoidMouse = !flockContainer.avoidMouse;
    flockContainer.checkboxFollow.checked(false);
  }
  
  function followMouseEvent() {
    if (!flockContainer.checkboxFollow.checked()) {
      flockContainer.checkboxFollow.checked(false);
      flockContainer.followMouse = false;
      return;
    }
    flockContainer.avoidMouse = false;
    flockContainer.followMouse = !flockContainer.followMouse;
    flockContainer.checkboxAvoid.checked(false);
  }
  
    
  function draw() {
    background(0);
    if (flockContainer.avoidMouse) {
      noCursor();
      tint(255, 0, 0);
      image(flockContainer.birdCursorImage, mouseX - 10, mouseY - 10, 32, 32);
    } else {
      cursor();
    }
    
    fill(255)
    text(`Alignment ${flockContainer.alignSlider.value()}`, flockContainer.alignSlider.x - 50, flockContainer.alignSlider.y + 18);
    text(`Cohesion ${flockContainer.cohesionSlider.value()}`, flockContainer.cohesionSlider.x - 50, flockContainer.cohesionSlider.y + 18);
    text(`Seperation ${flockContainer.separationSlider.value()}`, flockContainer.separationSlider.x - 50, flockContainer.separationSlider.y + 18);
    for (let boid of flockContainer.flock) {
      boid.update(flockContainer.flock, mouseX, mouseY);
      boid.show();
    }
  }