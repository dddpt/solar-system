
import {yr, sec} from "./core/spatialUnits.js"

export const config={
  simulSecPerRealSec: 1*yr/(30*sec),
  maxSimulTimestamp: 600000,
  debugLogInterval: 2000
}