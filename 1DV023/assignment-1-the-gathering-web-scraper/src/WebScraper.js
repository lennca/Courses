import nodeFetch from 'node-fetch'
import fetchCookie from 'fetch-cookie/node-fetch.js'
import { JSDOM } from 'jsdom'

const fetch = fetchCookie(nodeFetch)

/**
 * WebScraper class that will interact with the web-browser and scrape data.
 */
class WebScraper {
  /**
   * Method that fetch content from passed url.
   *
   * @param {string} url URL of web-page to be scraped
   * @returns {string} HTML-content as text that is being return from the fetch
   */
  async fetchContent (url) {
    const response = await fetch(url)
    return response.text()
  }

  /**
   * Method that extract all links from passed passed url.
   *
   * @param {string} url URL of page to be scraped
   * @returns {Array} Retrieved links from content of passed url
   */
  async extractLinks (url) {
    const text = await this.fetchContent(url)

    const dom = new JSDOM(text)
    const links = Array.from(dom.window.document.querySelectorAll('a')).map((a) => a.href)
    return links
  }

  /**
   * Method that extract table-data and table-header from passed url.
   *
   * @param {string} url URL of page to be scraped
   * @returns {Array} Array of days that person is available at
   */
  async extractDays (url) {
    const text = await this.fetchContent(url)

    const dom = new JSDOM(text)

    const th = Array.from(dom.window.document.querySelectorAll('th')).map((th) => th.textContent)
    const td = Array.from(dom.window.document.querySelectorAll('td')).map((td) => td.textContent)

    const daysArray = th.map((th, index) => {
      if (td[index].trim().toLowerCase() === 'ok') return th
      return undefined
    }).filter((value) => value !== undefined)

    return daysArray
  }

  /**
   * Method that queries all options under passed selection.
   *
   * @param {string} text HTML-content of fetched page
   * @param {string} selection Tag, class or id of element to be targeted
   * @returns {Array} Array of object returned and created from method
   */
  extractMovieBySelection (text, selection) {
    const dom = new JSDOM(text)

    const result = Array.from(dom.window.document.querySelector(selection).querySelectorAll('option:not([disabled=""])')).map((res) => {
      return {
        text: res.textContent,
        value: res.value
      }
    })

    return result
  }

  /**
   * Method that fetch times for each possible day and each movie.
   *
   * @param {string} url Super-path. Path that is the main path for the different requests
   * @param {Array} day Array of days possible to book movie on
   * @param {Array} movies Array of movies possible to watch
   * @returns {Array} Array of all reservations possible to do
   */
  async getPossibleMovieTimes (url, day, movies) {
    const reservation = movies.map(async (movie) => {
      const result = await this.fetchContent(`${url}/check?day=${day.value}&movie=${movie.value}`)
      return JSON.parse(result)
    })

    const promisedDays = await Promise.all([...reservation])
    const flatMovies = promisedDays.flat()

    return flatMovies
  }

  /**
   * Method that extract the form's action attribute.
   *
   * @param {string} text HTML-content of fetched page
   * @returns {string} Relative path of form-action
   */
  extractFormPath (text) {
    const dom = new JSDOM(text)

    const result = dom.window.document.querySelector('form').getAttribute('action')

    return result
  }

  /**
   * Method that make post-request to server.
   *
   * @param {string} url URL to be make a post-request to
   * @param {string} body Body-content to be sent with post request
   * @returns {object} Response from the server
   */
  async postRequest (url, body) {
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body
    })

    return response
  }

  /**
   * Method that extract all input values from passed text.
   *
   * @param {string} text Text to extract inputs from
   * @returns {Array} Array of inputs found in passed text
   */
  extractInputs (text) {
    const dom = new JSDOM(text)
    const values = Array.from(dom.window.document.querySelectorAll('input')).map((input) => input.value)
    return values
  }
}

export default WebScraper
