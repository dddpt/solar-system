import { OrbiterData, SpatialObjectData } from '../data/SolarSystemData';
import { DescriptiveOrbitalSystem } from './DescriptiveOrbitalSystem';
import { CircularOrbit } from './Orbit';

export class CircularOrbitalSystem extends DescriptiveOrbitalSystem{
  constructor(centerData: SpatialObjectData, orbitersData: OrbiterData[], OrbiterArtistClass: any){
    super(centerData, orbitersData, CircularOrbit, OrbiterArtistClass)
  }
}