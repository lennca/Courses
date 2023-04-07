import WebScraper from './WebScraper.js'
import validator from 'validator'

/**
 * Application class that handles the logic and interaction with the WebScraper.
 */
class Application {
  /**
   * Constructor of the class that setup properties.
   */
  constructor () {
    this.webScraper = new WebScraper()
    this.days = []
    this.movies = []
    this.dinners = []
    this.account = {
      username: 'zeke',
      password: 'coys'
    }
    this.bookingDinnerURL = undefined
  }

  /**
   * Method that starts the logic and has the responsibility to call correct method.
   *
   * @param {string} url The start-url that will be scraped first
   */
  async start (url) {
    try {
      if (!validator.isURL(url)) {
        throw new Error('Not a valid URL passed as argument to the start-method...')
      }

      const paths = await this.webScraper.extractLinks(url)
      console.log('Scraping links...OK')

      const scrapePromise = await Promise.all([
        this.getAvailableDays(paths),
        this.getAvailableMovies(paths)
      ])

      const scrapeList = ['Scraping available days...', 'Scraping showtimes...']
      scrapePromise.forEach((res, index) => console.log(`${scrapeList[index]}${res === true ? 'OK' : 'FAILED'}`))

      const dine = await this.getAvailableDinner(paths)
      console.log(`Scraping possible reservations...${dine === true ? 'OK' : 'FAILED'}`)

      if (!scrapeList[0] || !scrapeList[1] || !dine) {
        console.log('Scraping failed, can not calculate suggested gatherings for the friends...')
        return
      }

      const possibleGatherings = this.calculateGatherings()
      this.printResult(possibleGatherings)

      this.preBookDinner()
    } catch (error) {
      console.log(`Error: ${error.message}`)
    }
  }

  /**
   * Method that get all days that all the persons are available at and store them in property of class.
   *
   * @param {string} paths Links/URLS extracted from first-page
   * @returns {boolean} Return boolean based on if the method succeeded
   */
  async getAvailableDays (paths) {
    try {
      const calendarURL = paths.find((url) => url.includes('calendar'))
      const relativePaths = await this.webScraper.extractLinks(calendarURL)
      const personalCalendarURL = relativePaths.map((url) => calendarURL.concat(url.slice(2)))

      const daysPromises = personalCalendarURL.map((url) => this.webScraper.extractDays(url))
      const days = await Promise.all([...daysPromises])
      const flatDays = days.flat()

      const daysSet = [...new Set([...flatDays].filter((day) => this.getOccurrence(flatDays, day) === 3))]

      this.days = daysSet

      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Method that get all days and movies possible to watch and store them in property of class.
   *
   * @param {string} paths Links/URLS extracted from first-page
   * @returns {boolean} Return boolean based on if the method succeeded
   */
  async getAvailableMovies (paths) {
    try {
      const cinemaURL = paths.find((url) => url.includes('cinema'))
      const cinemaText = await this.webScraper.fetchContent(cinemaURL)

      const daysFromCinema = this.webScraper.extractMovieBySelection(cinemaText, '#day')
      const moviesFromCinema = this.webScraper.extractMovieBySelection(cinemaText, '#movies')

      const promisedMovies = daysFromCinema.map((day) => this.webScraper.getPossibleMovieTimes(cinemaURL, day, moviesFromCinema))
      const resolvedMovies = await Promise.all([...promisedMovies])
      const flatMovies = resolvedMovies.flat()
      const notFullyBooked = flatMovies.filter((movie) => movie.status === 1)

      const possibleMovies = this.modifyMovieObjects(daysFromCinema, moviesFromCinema, notFullyBooked)

      this.movies = possibleMovies
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Method that get all possible dining-times to book and store them in property of class.
   *
   * @param {string} paths Links/URLS extracted from first-page
   * @returns {boolean} Return boolean based on if the method succeeded
   */
  async getAvailableDinner (paths) {
    try {
      const loginPath = await this.getLoginPath(paths)

      // Login
      const { username, password } = this.account
      const body = `username=${username}&password=${password}&submit=login`
      const postLogin = await this.webScraper.postRequest(loginPath, body)

      this.bookingDinnerURL = postLogin.url

      // Get restricted page
      const getRedirectText = await this.webScraper.fetchContent(postLogin.url)

      const inputs = await this.webScraper.extractInputs(getRedirectText)

      this.dinners = inputs
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Method that get path for dinner sign in.
   *
   * @param {string} paths Links/URLS extracted from first-page
   * @returns {string} Path to make post-request
   */
  async getLoginPath (paths) {
    const dinnerURL = paths.find((url) => url.includes('dinner'))

    // Get path of form action
    const text = await this.webScraper.fetchContent(dinnerURL)
    const relativeFormPath = this.webScraper.extractFormPath(text)
    const loginPath = dinnerURL.concat(relativeFormPath.slice(2))

    return loginPath
  }

  /**
   * Help method to retrieve and modify reservations into right format with correct keys and values.
   *
   * @param {Array} days Days that are possible to watch movie on
   * @param {Array} movies Movies that are possible to watch
   * @param {Array} reservations Movie reservations that are possible to book
   * @returns {Array} Array of possible reservations with wanted keys and values
   */
  modifyMovieObjects (days, movies, reservations) {
    const availableReservations = reservations.map((reservation) => {
      const movie = movies.find((movie) => movie.value === reservation.movie)
      const day = days.find((day) => day.value === reservation.day)

      reservation.movie = movie.text
      reservation.day = day.text

      const { status, ...rest } = reservation

      return rest
    })

    return availableReservations
  }

  /**
   * Help method to get number of occurences in array.
   *
   * @param {Array} array Array to be iterated through
   * @param {string} value Value to check occurences of
   * @returns {number} Number of occurences
   */
  getOccurrence (array, value) {
    let count = 0
    array.forEach((item) => (item === value && count++))
    return count
  }

  /**
   * Method that take possible dinner reservations and format it into wanted format.
   *
   * @param {string} dinner Dinner object to be formatted
   * @returns {object} Formated dinner with day, start time and end time
   */
  formatDinnerObject (dinner) {
    const weekdays = ['friday', 'saturday', 'sunday']

    const weekday = weekdays.find((day) => day.startsWith(dinner.slice(0, 3)))

    const formattedDinnerObject = {
      day: weekday,
      start: dinner.slice(3, 5),
      end: dinner.slice(5)
    }

    return formattedDinnerObject
  }

  /**
   * Method that caluclates all possible gatherings.
   *
   * @returns {Array} Array of object with possible gatherings.
   */
  calculateGatherings () {
    const validGathering = []
    const validDinners = []

    const filterMovies = this.movies.filter((movie) => this.days.includes(movie.day))

    for (const rawDinner of this.dinners) {
      for (const movie of filterMovies) {
        if (!movie.day.toLowerCase().startsWith(rawDinner.slice(0, 3))) continue

        const formatDinner = this.formatDinnerObject(rawDinner)

        if (parseInt(movie.time.slice(0, 2)) + 2 <= formatDinner.start) {
          const formattedGathering = {
            day: movie.day,
            movie: movie.movie,
            movieStart: movie.time,
            dinnerStart: formatDinner.start,
            dinnerEnd: formatDinner.end
          }

          validGathering.push(formattedGathering)
          validDinners.push({ rawDinner, formatDinner })
        }
      }
    }

    this.dinners = validDinners
    return validGathering
  }

  /**
   * Method that format and print the results from the application to the console.
   *
   * @param {Array} gathering The results from earlier operations. Objects to print to console.
   */
  printResult (gathering) {
    console.log('\nSuggestions\n===========')

    gathering.forEach((suggestion) => {
      const { day, movie, movieStart, dinnerStart, dinnerEnd } = suggestion
      console.log(`* On ${day}, "${movie}" begins at ${movieStart}, and there is a free table to book between ${dinnerStart}:00-${dinnerEnd}:00.`)
    })
  }

  /**
   * Method that pre-book table at restaurant.
   */
  async preBookDinner () {
    const bookDinner = this.dinners[0]

    const body = `group1=${this.dinners[0].rawDinner}`
    const dinnerBookResponse = await this.webScraper.postRequest(this.bookingDinnerURL, body)

    if (dinnerBookResponse.status === 200) {
      const { day, start, end } = bookDinner.formatDinner
      console.log(`\nPre-booked table at ${day} between ${start}:00-${end}:00.`)
    } else {
      console.log('Something happened... Could not make a pre-reservations for the friends...')
    }
  }
}

export default Application
