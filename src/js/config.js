
import {yr, sec, d} from "./core/spatialUnits.js"

export const config={
  simulSecPerRealSec: 1*yr/(30*sec),
  maxSimulTimestamp: 1000000,
  debugLogInterval: 2000,
  animateSimulationMsecMaxInterval: 1*d
}