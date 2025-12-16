

// ======================== Distance ======================== 
// converts any distance to AU distance by multiplying it by the appropriate unit
// 10 * distance.km = 10km in AU unit
export type Distance=number
export type Au=Distance
export type Km=Distance
export type M=Distance
export type Pc=Distance

export const au:Au = 1
export const km:Au = 1 / (1.495978707*10**8) * au
export const m:Au = km/1000 * au
export const pc:Au = 648000 / Math.PI * au
export const distance = {km, au, m, pc}

// ======================== Time ======================== 
// converts any duration to milliseconds by multiplying it by the appropriate unit
export type Time=number
export type Msec = Time
export type Sec = Time
export type Min = Time
export type H = Time
export type D = Time
export type W = Time
export type Month = Time // APPROXIMATION
export type Yr = Time

export const msec:Msec = 1
export const sec:Msec = 1000
export const min:Msec = 60 * sec
export const h:Msec = min * 60
export const d:Msec = h * 24
export const w:Msec = d * 7
export const month:Msec = d * 30 // APPROXIMATION
export const yr:Msec = d * 365.25
export const time = {
  msec, sec, min, h, d, w, month, yr
}

// ======================== Mass ======================== 
// converts any mass to kg mass by multiplying it by the appropriate unit
export type Mass = number
export type Gram = Mass
export type Kg = Mass
export type Ton = Mass
export type Kiloton = Mass

export const gram: Kg = 1000;
export const kg: Kg = 1;
export const ton: Kg = 1/1000;
export const kiloton: Kg = ton / 1000;
export const mass = {
  gram, kg, ton, kiloton
}
export const gravitationalConstant = 6.67430 * 10**(-11) * m**3 / kg / sec**2 

// ======================== Angles ======================== 
// converts any angle to rad angle
export type Rad = number
export type Deg = number

export const rad:Rad = 1
export const deg:Rad = 1 / 360 * 2 * Math.PI * rad
export const angle = {
  rad, deg
}

// ======================== Coordinates ======================== 
export type CarthesianCoordinates = [x: Au, y: Au]
export type PolarCoordinates = [angle: Rad, radius: Au]

// polar to carthesian coordinates, distance unit not relevant
export const toCarthesian = {
  radians(radAngle: Rad, distance:Au): CarthesianCoordinates{
    const x = distance * Math.cos(radAngle) // radAngle = acos(x/auDist)
    const y = distance * Math.sin(radAngle)
    return [x, y]
  }
}

// carthesian to polar coordinates, distance unit not relevant
export const toPolar = {
  radians(x:number, y:number): PolarCoordinates{
    const distance = Math.sqrt(x**2+y**2)
    const rad = Math.acos(x/distance)
    return [rad, distance]
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