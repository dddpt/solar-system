import { DescriptiveOrbitalSystem } from './DescriptiveOrbitalSystem.js'
import { CircularOrbit } from './Orbit';

export class CircularOrbitalSystem extends DescriptiveOrbitalSystem{
  constructor(centerData, orbitersData, OrbiterArtistClass){
    super(centerData, orbitersData, CircularOrbit, OrbiterArtistClass)
  }
}