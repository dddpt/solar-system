
import { orderBodies } from '../core/OrbitalSystem';
import { OrbiterData, SpatialObjectData } from '../data/SolarSystemData';
import { DescriptiveOrbitalSystem } from './DescriptiveOrbitalSystem'
import { EllipticOrbitState } from './EllipticOrbit';
import { KeplerOrbit } from './Orbit';

export class KeplerOrbitalSystem extends DescriptiveOrbitalSystem<EllipticOrbitState, KeplerOrbit>{
  constructor(
    orbitingBodies: KeplerOrbit[],
    nonOrbitingBodies: SpatialObjectData[]
  ){
    super(orbitingBodies, nonOrbitingBodies)
  }

  static fromData(
    bodiesData: (SpatialObjectData | OrbiterData)[],
  ): KeplerOrbitalSystem {
  
    const bodiesDataOrdered = orderBodies(bodiesData)

    const bodies: KeplerOrbit[] = bodiesDataOrdered.filter(bd=>bd.orbitCenterId).map(bodyData=>
      KeplerOrbit.fromData(
        bodyData as OrbiterData,
        bodiesDataOrdered.find(b=>b.id==bodyData.orbitCenterId)
      )
    )
    const nonOrbitingBodies: SpatialObjectData[] = bodiesDataOrdered.filter(bd=>!bd.orbitCenterId)
    return new KeplerOrbitalSystem(bodies, nonOrbitingBodies)
  }
}