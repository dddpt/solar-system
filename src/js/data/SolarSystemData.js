import { km, m, au, d, deg, kg } from "../core/spatialUnits";

export const epochs = {
  J2000: new Date(2000, 0, 1, 12)
}

export const sun = {
  name: "Sun",
  standardGravitationalParameter: 1.32712440018*(10**20)*m**3,
  meanRadius: 696342*km,
  mass: 1.9884 * 10**30*kg,
  color: 0xffff66,
  three: {}
}
export const mercury = {
  name: "Mercury",
  orbitCenterName: "Sun",
  standardGravitationalParameter: 2.2032*(10**13)*m**3,
  epoch: epochs.J2000,
  semiMajorAxis: 0.387098*au,
  eccentricity: 0.20563,
  orbitalPeriod: 87.9691 * d,
  meanAnomaly: 174.796*deg,
  meanRadius: 2439.7*km,
  longitudeOfAscendingNode: 48.331*deg,
  inclination: 7.005*deg,
  argumentOfPeriapsis: 29.124*deg,
  mass: 3.3011*10**23*kg,
  color: 0xb3b3b3,
  three: {}
}
export const venus = {
  name: "Venus",
  orbitCenterName: "Sun",
  standardGravitationalParameter: 3.24859*(10**14)*m**3,
  epoch: epochs.J2000,
  semiMajorAxis: 0.723332*au,
  eccentricity: 0.006772,
  orbitalPeriod: 224.701 * d,
  meanAnomaly: 50.115*deg,
  meanRadius: 6051.8*km,
  longitudeOfAscendingNode: 76.68*deg,
  inclination: 3.39458*deg,
  argumentOfPeriapsis: 54.884*deg,
  mass: 4.8675 * 10**24*kg,
  color: 0xffcc99,
  three: {}
}
export const earth = {
  name: "Earth",
  orbitCenterName: "Sun",
  standardGravitationalParameter: 3.986004418*(10**14)*m**3,
  epoch: epochs.J2000,
  semiMajorAxis: 149598023*km,
  eccentricity: 0.0167086,
  orbitalPeriod: 365.25*d,//365.256363004*d, // APPROX FOR TESTING
  meanAnomaly: 358.617*deg,
  meanRadius: 6371*km,
  longitudeOfAscendingNode: -11.26064*deg,
  inclination: 0.00005*deg,
  argumentOfPeriapsis: 114.20783*deg,
  mass: 5.97237 * 10**24*kg,
  color: 0x0000ff,
  three: {}
}
export const mars = {
  name: "Mars",
  orbitCenterName: "Sun",
  standardGravitationalParameter: 4.282837*(10**13)*m**3,
  epoch: epochs.J2000,
  semiMajorAxis: 227939200*km,
  eccentricity: 0.0934,
  orbitalPeriod: 686.971 * d,
  meanAnomaly: 0*deg, // MISSING IN WIKIPEDIA  MISSING IN WIKIPEDIA  MISSING IN WIKIPEDIA
  meanRadius: 3389.5*km,
  longitudeOfAscendingNode: 49.558*deg,
  inclination: 1.85*deg,
  argumentOfPeriapsis: 286.502*deg,
  mass: 6.4171 * 10**23*kg,
  color: 0xff8533,
  three: {}
}
export const jupiter = {
  name: "Jupiter",
  orbitCenterName: "Sun",
  standardGravitationalParameter: 1.26686534*(10**17)*m**3,
  epoch: epochs.J2000,
  semiMajorAxis: 5.2044*au,
  eccentricity: 0.0489,
  orbitalPeriod: 4332.59 * d,
  meanAnomaly: 20.02*deg,
  meanRadius: 69911*km,
  longitudeOfAscendingNode: 100.464*deg,
  inclination: 1.303*deg,
  argumentOfPeriapsis: 273.867*deg,
  mass: 1.8982 * 10**27*kg,
  color: 0xffe6b3,
  three: {}
}
export const saturn = {
  name: "Saturn",
  orbitCenterName: "Sun",
  standardGravitationalParameter: 3.7931187*(10**16)*m**3,
  epoch: epochs.J2000,
  semiMajorAxis: 9.5826*au,
  eccentricity: 0.0565,
  orbitalPeriod: 10759.22 * d,
  meanAnomaly: 317.02*deg,
  meanRadius: 58232*km,
  longitudeOfAscendingNode: 113.665*deg,
  inclination: 2.485*deg,
  argumentOfPeriapsis: 339.392*deg,
  mass: 5.6834 * 10**26*kg,
  color: 0xd6d6c2,
  three: {}
}
export const uranus = {
  name: "Uranus",
  orbitCenterName: "Sun",
  standardGravitationalParameter: 5.793939*(10**15)*m**3,
  epoch: epochs.J2000,
  semiMajorAxis: 19.2184*au,
  eccentricity: 0.046381,
  orbitalPeriod: 30688.5 * d,
  meanAnomaly: 142.2386*deg,
  meanRadius: 25362*km,
  longitudeOfAscendingNode: 74.006*deg,
  inclination: 0.773*deg,
  argumentOfPeriapsis: 96.998857*deg,
  mass: 8.681 * 10**25*kg,
  color: 0xadebeb,
  three: {}
}
export const neptune = {
  name: "Neptune",
  orbitCenterName: "Sun",
  standardGravitationalParameter: 6.836529*(10**15)*m**3,
  epoch: epochs.J2000,
  semiMajorAxis: 30.11*au,
  eccentricity: 0.009456,
  orbitalPeriod: 60182 * d,
  meanAnomaly: 256.228*deg,
  meanRadius: 24622*km,
  longitudeOfAscendingNode: 131.784*deg,
  inclination: 1.767975*deg,
  argumentOfPeriapsis: 276.336*deg,
  mass: 1.02413 * 10**26*kg,
  color: 0x7094db,
  three: {}
}
export const pluto = {
  name: "Pluto",
  orbitCenterName: "Sun",
  standardGravitationalParameter: 8.71*(10**11)*m**3,
  epoch: epochs.J2000,
  semiMajorAxis: 39.482*au,
  eccentricity: 0.2488,
  orbitalPeriod: 90560 * d,
  meanAnomaly: 14.53*deg,
  meanRadius: 1188.3*km,
  longitudeOfAscendingNode: 110.299*deg,
  inclination: 17.16*deg,
  argumentOfPeriapsis: 113.834*deg,
  mass: 1.303 * 10**22*kg,
  color: 0x777777,
  three: {}
}
export const planets = [
  mercury, venus, earth, mars, jupiter, saturn, uranus, neptune, pluto
]

export const astronomicalBodies = [sun].concat(planets)
//astronomicalBodies.forEach(p => {if(p.orbitCenterName){p.orbitCenter = astronomicalBodies.find(b=>b.name==p.orbitCenterName)}})
astronomicalBodies.get = function(aName){return this.find(a=>a.name.toLowerCase()==aName.toLowerCase())}
astronomicalBodies.getOrbiters = function(ocName){
  const ocname = ocName.toLowerCase()
  return this.filter(a=>a.orbitCenterName.toLowerCase()==ocname)
}

