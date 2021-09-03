import { Eps } from './models/eps';

const seed = async () => {
  const epsList = await Eps.find({});
  if (epsList.length === 0) {
    console.log(`Seeding EPS`);
    [
      'Compensar',
      'Sanitas',
      'Famisanar',
      'Salud Total',
      'Suramericana',
      'Nueva EPS',
      'Coomeva',
      'Cruz Blanca ',
      'Comfenalco Valle',
      'Saludvida S.A.',
      'Servicio Occidental de Salud S.A.',
      'Aliansalud Entidad Promotora de Salud',
      'Medimas',
      'Mutual Ser',
      'Convida',
      'Emdisalud',
      'Cajacopi Atlántico',
      'Asmet Salud',
      'Caja de Compensación Familiar de Sucre',
      'Comfacundi',
      'Comfacor',
      'Pijaos Salud',
      'Capital Salud',
      'Comparta',
      'Copresoca',
      'Asociación Mutual Barrios Unidos de Quibdó',
      'Caja de Compensación Familiar de la Guajira',
      'Mallamas',
      'Asociación Indígena del Cauca',
      'Coosalud',
      'Ecoopsos',
      'Emssanar',
      'Dusawaki',
      'Saludvida',
      'Savia Salud',
      'Comfamiliar Huila',
      'Medimas',
      'Comfaoriente',
      'Comfamiliar Cartagena',
      'Comfamiliar Nariño',
      'Anaswayuu',
      'Comfachocó',
    ].map(async (eps) => {
      const newEps = Eps.build({
        name: eps,
      });
      await newEps.save();
    });
  }
};

export default seed;
