
import {yr, sec, d, h} from "./core/spatialUnits"
import { earth, mars } from "./data/SolarSystemData"

const maxAnimationDuration = 20000

export const config={
  simulSecPerRealSec: earth.orbitalPeriod/maxAnimationDuration,//1*yr/(300*sec),// =1yr in 300sec?
  maxAnimationDuration: maxAnimationDuration,//365.25*d, // maximum amount of time the animation
  debugLogInterval: 2000,
  textUpdateInterval: 500,
  animateSimulationMsecMaxInterval: 20*d
}