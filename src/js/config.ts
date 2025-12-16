
import {yr, sec, d, h} from "./core/spatialUnits"

export const config={
  simulSecPerRealSec: 1*yr/(300*sec),
  maxSimulTimestamp: 1000000,
  debugLogInterval: 2000,
  textUpdateInterval: 500,
  animateSimulationMsecMaxInterval: 20*d
}