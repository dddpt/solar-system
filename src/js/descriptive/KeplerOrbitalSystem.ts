
import { DescriptiveOrbitalSystem } from './DescriptiveOrbitalSystem.js'
import { KeplerOrbit } from './Orbit';

export class KeplerOrbitalSystem extends DescriptiveOrbitalSystem{
  constructor(centerData, orbitersData, OrbiterArtistClass){
    super(centerData, orbitersData, KeplerOrbit, OrbiterArtistClass)
  }
}