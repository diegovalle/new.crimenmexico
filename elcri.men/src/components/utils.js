export function YYYYmmddToDate15(str) {
  let date = new Date()

  // if it's an array assume the first element is the date
  if (Object.prototype.toString.call(str) === '[object Array]') {
    str = str[0]
  }
  let date_components = str.split('-')
  date.setDate(15)
  date.setFullYear(date_components[0])
  // js months start at 0
  date.setMonth(date_components[1] - 1)
  return date
}

function YYYYmmddArrayToDate(arr) {
  return arr.map((item) => YYYYmmddToDate15(item))
}

export function YYYYmmddCollectionToDate(col, acc) {
  return col.map((item) => {
    var temp = Object.assign({}, item)
    temp[acc] = YYYYmmddToDate15(temp[acc])
    return temp
  })
}

export function titleCasePlaces(str) {
  if (str.length <= 4) return str
  let before_comma,
    after_comma = '',
    comma = str.lastIndexOf(',')
  if (comma >= 0) {
    before_comma = str.substr(0, comma)
    after_comma = str.substr(comma)
  } else before_comma = str
  before_comma = before_comma.toLowerCase()
  let splitStr = before_comma.toLowerCase().split(' ')
  for (let i = 0; i < splitStr.length; i++) {
    splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1)
  }
  return splitStr.join(' ') + after_comma
}

export function pretty(values, n = 3) {
  if (values.length === 0) return []
  const min = Math.min(...values)
  const max = Math.max(...values)

  // Handle single value case
  if (min === max) return [min]

  const rawStep = (max - min) / n
  const magnitude = 10 ** Math.floor(Math.log10(rawStep))
  const base = rawStep / magnitude

  // Find closest "nice" base from standard candidates
  const candidates = [1, 2, 5, 10]
  const closest = candidates.reduce((a, b) =>
    Math.abs(base - a) < Math.abs(base - b) ? a : b
  )

  const unit = closest * magnitude
  const start = Math.floor(min / unit) * unit
  const end = Math.ceil(max / unit) * unit

  // Generate sequence
  const sequence = []
  for (let i = start; i <= end; i += unit) {
    sequence.push(parseFloat(i.toFixed(10)))
  }

  return sequence
}
