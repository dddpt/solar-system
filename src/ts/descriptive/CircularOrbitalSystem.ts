import { orderBodies } from '../core/OrbitalSystem';
import { SpatialObjectState } from '../core/SpaceObject';
import { OrbiterData, SpatialObjectData } from '../data/SolarSystemData';
import { DescriptiveOrbitalSystem } from './DescriptiveOrbitalSystem';
import { CircularOrbit } from './Orbit';

export class CircularOrbitalSystem extends DescriptiveOrbitalSystem<SpatialObjectState, CircularOrbit>{
  constructor(
      orbitingBodies: CircularOrbit[],
      nonOrbitingBodies: SpatialObjectData[]
    ){
      super(orbitingBodies, nonOrbitingBodies)
    }

    static fromData(
      bodiesData: (SpatialObjectData | OrbiterData)[],
    ): CircularOrbitalSystem {
    
      const bodiesDataOrdered = orderBodies(bodiesData)
  
      const bodies: CircularOrbit[] = bodiesDataOrdered.filter(bd=>bd.orbitCenterId).map(bodyData=>
        CircularOrbit.fromData(
          bodyData as OrbiterData,
          bodiesDataOrdered.find(b=>b.id==bodyData.orbitCenterId)
        )
      )
      const nonOrbitingBodies: SpatialObjectData[] = bodiesDataOrdered.filter(bd=>!bd.orbitCenterId)
      return new CircularOrbitalSystem(bodies, nonOrbitingBodies)
    }
}