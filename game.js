const CANVAS_WIDTH = 600,
    CANVAS_HEIGHT = 600,
    MARGIN = 20,
    LIVES = 3,
    DESTROYING_SCORE_AMOUNT = 10

class Ship {
    bullets = []

    constructor(width, height, x, y, type = 'color', color = 'blue') {
        this.width = width
        this.height = height
        this.x = x
        this.y = y
        this.type = type
        this.color = color

        this.readyToShoot = true

        if (this.type === 'image') {
            this.image = new Image()
            this.image.src = this.color
        }
    }

    update() {
        const ctx = game.ctx

        if (this.type === 'color') {
            ctx.fillStyle = this.color
            ctx.fillRect(this.x, this.y, this.width, this.height)
        } else if (this.type === 'image') {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height)
        }
    }

    shoot() {
        if (this.bullets.length < 3 && this.readyToShoot) {
            new Audio('laser.m4a').play()

            this.bullets.push(new Bullet((this.x + (this.width / 2) - 2.5), this.y + 10))

            this.readyToShoot = false

            setTimeout(() => {
                this.readyToShoot = true
            }, 500)
        }
    }
}

class Bullet {
    constructor(x, y) {
        this.x = x
        this.y = y
    }

    update() {
        const ctx = game.ctx

        ctx.fillStyle = 'red'
        ctx.fillRect(this.x, this.y, 5, 20)
    }
}

const game = {
    canvas: document.getElementById('game'),
    frame: 0,
    keys: [],
    lives: LIVES,
    player: new Ship(50, 50, CANVAS_WIDTH / 2 - 25, CANVAS_HEIGHT - 50 - MARGIN, 'image', 'ship.png'),
    enemies: [],
    score: 0,
    status: 0,

    showMainMenu() {
        const ctx = this.ctx

        ctx.font = 'bold 35px Times New Roman'
        ctx.fillStyle = 'white'
        ctx.textAlign = 'center'

        ctx.fillText('Fly Fighter', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)

        ctx.font = 'bold 15px Times New Roman'

        ctx.fillText('Klik untuk bermain', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 25)
        ctx.fillText('Gunakan anak panah untuk bergerak', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50)
        ctx.fillText('Gunakan tombol spasi untuk menembak', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 75)

        this.canvas.addEventListener('click', () => {
            this.startGame()
        }, { once: true })
    },

    showRestart(message) {
        let ctx = this.ctx

        ctx.fillStyle = 'white'
        ctx.fillRect((CANVAS_WIDTH / 2) - 50, CANVAS_HEIGHT / 2 + 10, 100, 40)

        ctx = this.ctx

        ctx.font = 'bold 35px Times New Roman'
        ctx.fillStyle = 'white'
        ctx.textAlign = 'center'

        ctx.fillText(message, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)

        ctx.font = 'bold 15px Times New Roman'
        ctx.fillStyle = 'black'

        ctx.fillText('Main Lagi?', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 35)

        this.canvas.addEventListener('click', () => {
            this.startGame()
        }, { once: true })
    },

    start() {
        this.canvas.width = this.canvas.height = 600
        this.ctx = this.canvas.getContext('2d')
        this.status = 0

        this.showMainMenu()
    },

    startGame() {
        this.status = 1

        this.reset(true)

        this.update()

        document.addEventListener('keydown', (event) => {
            this.keys[event.code] = true
        })

        document.addEventListener('keyup', (event) => {
            this.keys[event.code] = false
        })
    },

    reset(full = false) {
        this.frame = 0
        this.player = new Ship(50, 50, CANVAS_WIDTH / 2 - 25, CANVAS_HEIGHT - 50 - MARGIN, 'image', 'ship.png')
        this.enemies = []

        if (full) {
            cancelAnimationFrame(this.request)
            this.lives = LIVES
            this.score = 0
        }
    },

    showStatus() {
        const ctx = this.ctx

        ctx.textAlign = 'start'
        ctx.font = '15px Times New Roman'
        ctx.fillStyle = 'white'

        ctx.fillText('Lives: ' + this.lives, 20, MARGIN + 10)
        ctx.fillText('Score: ' + this.score, 20, (MARGIN + 10) * 2)
    },

    checkCollision() {
        for (let i = 0; i < this.enemies.length; i++) {
            const enemy = this.enemies[i]
            let crashed = true

            if (
                this.player.x > enemy.x + enemy.width ||
                this.player.x + this.player.width < enemy.x ||
                this.player.y > enemy.y + enemy.height ||
                this.player.y + this.player.height < enemy.y
            ) {
                crashed = false
            }

            if (crashed) return true
        }

        return false
    },

    checkEnemiesPosition() {
        this.enemies.forEach((enemy, index) => {
            if (enemy.y > CANVAS_HEIGHT) {
                this.enemies.splice(index, 1)
            }
        })
    },

    addScore(amount) {
        this.score += amount
    },

    checkBulletsCollision() {
        if (this.player.bullets.length && this.enemies.length) {
            for (let i = 0; i < this.player.bullets.length; i++) {
                for (let j = 0; j < this.enemies.length; j++) {
                    if (this.player.bullets[i]) {
                        const bullet = this.player.bullets[i]
                        const enemy = this.enemies[j]

                        let crashed = true

                        if (
                            bullet.x > enemy.x + enemy.width ||
                            bullet.x < enemy.x ||
                            bullet.y > enemy.y + enemy.height ||
                            bullet.y < enemy.y
                        ) {
                            crashed = false
                        }

                        if (crashed) {
                            this.player.bullets.splice(i, 1)
                            this.enemies.splice(j, 1)

                            this.addScore(DESTROYING_SCORE_AMOUNT)
                        }
                    } else {
                        break
                    }
                }
            }
        }
    },

    checkBulletsPosition() {
        this.player.bullets.forEach((bullet, index) => {
            if (bullet.y < 0) {
                this.player.bullets.splice(index, 1)
            }
        })
    },

    randomNumber(min, max) {
        return Math.floor(Math.random() * ((max + 1) - min) + min)
    },

    spawnRandomEnemies() {
        const enemiesAmount = this.randomNumber(3, 5)

        for (let i = 0; i < enemiesAmount; i++) {
            const x = this.randomNumber(MARGIN, CANVAS_WIDTH - MARGIN - 50)
            const y = this.randomNumber(-200, -50)

            this.enemies.push(new Ship(50, 40, x, y, 'image', 'musuh.png'))
        }
    },

    update() {
        if (this.checkCollision()) {
            this.lives--

            if (this.lives === 0) {
                this.status = 0
            } else {
                this.reset()
            }
        }

        this.checkEnemiesPosition()

        this.checkBulletsCollision()
        this.checkBulletsPosition()

        if (this.score === 50) {
            this.showRestart('Anda menang!')
            this.status = 2
        }

        this.clear()

        this.showStatus()

        this.frame++

        if (this.frame === 1) {
            this.enemies.push(new Ship(50, 40, MARGIN + 20, MARGIN + 20, 'image', 'musuh.png'))
            this.enemies.push(new Ship(50, 40, (CANVAS_WIDTH / 2 - (2 * MARGIN)) / 2 + 25, MARGIN + 20, 'image', 'musuh.png'))
            this.enemies.push(new Ship(50, 40, CANVAS_WIDTH / 2 - 25, MARGIN + 20, 'image', 'musuh.png'))
            this.enemies.push(new Ship(50, 40, (CANVAS_WIDTH / 2 - (2 * MARGIN)) / 2 + 25 + (CANVAS_WIDTH / 2 - 2 * MARGIN) - 25, MARGIN + 20, 'image', 'musuh.png'))
            this.enemies.push(new Ship(50, 40, CANVAS_WIDTH - 50 - (MARGIN + 20), MARGIN + 20, 'image', 'musuh.png'))
        } else if (this.enemies.length === 0) {
            this.spawnRandomEnemies()
        }

        if (this.keys['ArrowLeft']) this.player.x -= 5
        if (this.keys['ArrowUp']) this.player.y -= 5
        if (this.keys['ArrowRight']) this.player.x += 5
        if (this.keys['ArrowDown']) this.player.y += 5

        this.player.update()

        if (this.keys['Space']) this.player.shoot()

        if (this.player.bullets.length) {
            this.player.bullets.forEach(bullet => {
                bullet.y -= 10

                bullet.update()
            })
        }

        this.enemies.forEach(enemy => {
            enemy.y += 2

            enemy.update()
        })

        if (this.status === 1) this.request = requestAnimationFrame(this.update.bind(this))
        else if (this.status === 2) this.showRestart('Anda Menang!')
        else if (this.status === 0) this.showRestart('Game Over!')
    },

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }
}

game.start()