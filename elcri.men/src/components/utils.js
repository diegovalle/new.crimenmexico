export function YYYYmmddToDate15(str) {
  let date = new Date()

  let date_components = str.split('-')
  date.setFullYear(date_components[0])
  // js months start at 0
  date.setMonth(date_components[1] - 1)
  date.setDate(15)
  return date
}

function YYYYmmddArrayToDate(arr) {
  return arr.map(item => YYYYmmddToDate15(item))
}

export function YYYYmmddCollectionToDate(col, acc) {
  return col.map(item => {
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
