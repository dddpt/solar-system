
import { OrbiterData, SpatialObjectData } from '../data/SolarSystemData';
import { DescriptiveOrbitalSystem } from './DescriptiveOrbitalSystem'
import { KeplerOrbit } from './Orbit';

export class KeplerOrbitalSystem extends DescriptiveOrbitalSystem{
  constructor(centerData: SpatialObjectData, orbitersData: OrbiterData[], OrbiterArtistClass: any){
    super(centerData, orbitersData, KeplerOrbit, OrbiterArtistClass)
  }
}