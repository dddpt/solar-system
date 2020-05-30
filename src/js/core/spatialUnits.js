

// ======================== Distance ======================== 
// converts any distance to AU distance by multiplying it by the appropriate unit
// 10 * distance.km = 10km in AU unit
export const au = 1
export const km = 1 / (1.495978707*10**8) * au
export const m = km/1000 * au
export const pc = 648000 / Math.PI * au
export const distance = {
  km, au, pc
}

// ======================== Time ======================== 
// converts any duration to milliseconds by multiplying it by the appropriate unit
export const msec = 1
export const sec = 1000
export const min = 60 * sec
export const h = min * 60
export const d = h * 24
export const w = d * 7
export const month = d * 30 // APPROXIMATION
export const yr = d * 365.25
export const time = {
  msec, sec, min, h, d, w, month, yr
}

// ======================== Mass ======================== 
// converts any mass to kg mass by multiplying it by the appropriate unit
export const gram = 1000
export const kg = 1
export const ton = 1/1000
export const kiloton = ton / 1000
export const mass = {
  gram, kg, ton, kiloton
}
export const gravitationalConstant = 6.67430 * 10**11 * m**3 / kg / sec**2 

// ======================== Angles ======================== 
// converts any angle to rad angle
export const rad = 1
export const deg = 1 / 360 * 2 * Math.PI * rad
export const angle = {
  rad, deg
}

// ======================== Coordinates ======================== 
// polar to carthesian coordinates, distance unit not relevant
export const toCarthesian = {
  radians(radAngle, distance){
    const x = distance * Math.cos(radAngle) // radAngle = acos(x/auDist)
    const y = distance * Math.sin(radAngle)
    return {x, y}
  }
}

// carthesian to polar coordinates, distance unit not relevant
export const toPolar = {
  radians(x, y){
    const distance = Math.sqrt(x**2, y**2)
    const rad = Math.acos(x/distance)
    return {rad, distance}
  }
}

// ======================== Global units object ======================== 

export const units = {
  distance,
  time,
  angle,
  coord:{toCarthesian, toPolar},
  mass,
  gravitationalConstant
}