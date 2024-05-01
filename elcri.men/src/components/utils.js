

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

