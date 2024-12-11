const PIXEL_SIZE = 10

// Create a function to generate a grid of random black-and-white noise data
const generateNoiseGrid = (width, height) => {
  const grid = new Uint8ClampedArray(width * height * 4)
  for (let y = 0; y < height; y += PIXEL_SIZE) {
    for (let x = 0; x < width; x += PIXEL_SIZE) {
      const color = Math.random() > 0.5 ? 255 : 0
      for (let dy = 0; dy < PIXEL_SIZE; dy++) {
        for (let dx = 0; dx < PIXEL_SIZE; dx++) {
          const index = ((y + dy) * width + (x + dx)) * 4
          grid[index] = color
          grid[index + 1] = color
          grid[index + 2] = color
          grid[index + 3] = 255
        }
      }
    }
  }
  return grid
}

// Generate a bitmap of a square with random noise based on the given width and height and PIXEL_SIZE
const noisySquare = (width, height) => {
  const grid = new Uint8ClampedArray(width * height * 4)
  for (let y = 0; y < height; y += PIXEL_SIZE) {
    for (let x = 0; x < width; x += PIXEL_SIZE) {
      const color = Math.random() > 0.5 ? 255 : 0
      for (let dy = 0; dy < PIXEL_SIZE; dy++) {
        for (let dx = 0; dx < PIXEL_SIZE; dx++) {
          const index = ((y + dy) * width + (x + dx)) * 4
          grid[index] = color
          grid[index + 1] = color
          grid[index + 2] = color
          grid[index + 3] = 255
        }
      }
    }
  }
  return grid
}

const onLoad = () => {
  const canvas = document.getElementById('canvas')
  const ctx = canvas.getContext('2d')
  const width = (canvas.width = window.innerWidth)
  const height = (canvas.height = window.innerHeight)

  // Create an off-screen buffer to manage the animated noise
  const offscreenCanvas = document.createElement('canvas')
  offscreenCanvas.width = width + PIXEL_SIZE // Extra width for smooth wrapping
  offscreenCanvas.height = height
  const offscreenCtx = offscreenCanvas.getContext('2d')

  // Fill the offscreen buffer with initial noise
  const initialNoise = generateNoiseGrid(offscreenCanvas.width, height)
  const imageData = new ImageData(initialNoise, offscreenCanvas.width, height)
  offscreenCtx.putImageData(imageData, 0, 0)

  // Generate a noisy square
  const square = noisySquare(100, 100)
  const squareImageData = new ImageData(square, 100, 100)
  ctx.putImageData(squareImageData, 0, 0)

  let offsetX = 0
  let targetFPS = 60 // Set the target FPS
  const interval = 1000 / targetFPS // Time between frames in milliseconds
  let lastTime = 0 // Time of the last frame
  let isAnimating = true // To track if animation is running

  const animate = (timestamp) => {
    // Stop animation if targetFPS is 0 (or isAnimating is false)
    if (!isAnimating) return

    // Calculate the time elapsed
    const deltaTime = timestamp - lastTime

    // Only proceed if enough time has passed to match the target FPS
    if (deltaTime >= interval) {
      // Clear the canvas
      ctx.clearRect(0, 0, width, height)

      lastTime = timestamp - (deltaTime % interval) // Adjust the last time to maintain consistent FPS

      // Scroll the noise to the right
      offsetX = offsetX % PIXEL_SIZE

      // Draw the noise onto the visible canvas
      ctx.drawImage(offscreenCanvas, 0, 0, width, height, 0, 0, width, height)

      // Draw the square
      ctx.putImageData(squareImageData, 100, 100)
      ctx.putImageData(squareImageData, 400, 200)
      ctx.putImageData(squareImageData, 800, 200)

      // Check if a new column of noise is needed
      if (offsetX === 0) {
        const newColumn = generateNoiseGrid(PIXEL_SIZE, height)
        const newColumnImageData = new ImageData(newColumn, PIXEL_SIZE, height)
        offscreenCtx.putImageData(newColumnImageData, offscreenCanvas.width - PIXEL_SIZE, 0)

        // Shift the offscreen canvas contents to the left
        const shiftedData = offscreenCtx.getImageData(PIXEL_SIZE, 0, offscreenCanvas.width, height)
        offscreenCtx.putImageData(shiftedData, 0, 0)
      }
    }

    // Request the next frame
    if (isAnimating) {
      requestAnimationFrame(animate)
    }
  }

  // Add event listener to start/stop buttons so we can start and stop the animation
  const startButton = document.getElementById('start')
  const stopButton = document.getElementById('stop')

  startButton.addEventListener('click', () => {
    isAnimating = true
    animate(performance.now()) // Restart the animation
  })

  stopButton.addEventListener('click', () => {
    isAnimating = false // Stop the animation
  })

  animate() // Start the animation when the page loads
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', onLoad)
} else {
  onLoad()
}
