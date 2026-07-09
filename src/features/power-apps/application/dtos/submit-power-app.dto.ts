import { z } from 'zod';

export const submitPowerAppSchema = z.object({
  leadId: z.string().trim().min(1).optional(),
  campana: z.string().trim().min(1).optional(),
  empresa: z.object({
    nit: z.string().trim().min(1, 'El NIT de la empresa es obligatorio'),
    razonSocial: z.string().trim().min(1, 'La razón social es obligatoria'),
    segmento: z.string().trim().min(1, 'El segmento es obligatorio'),
    ciudad: z.string().trim().min(1, 'La ciudad de la empresa es obligatoria'),
    direccion: z.string().trim().min(1, 'La dirección de la empresa es obligatoria'),
  }),
  tarjetahabiente: z.object({
    tipoDocumento: z.enum(['CC', 'CE', 'PA', 'TI']),
    numeroDocumento: z.string().trim().min(1, 'El documento del tarjetahabiente es obligatorio'),
    nombres: z.string().trim().min(1, 'Los nombres del tarjetahabiente son obligatorios'),
    apellidos: z.string().trim().min(1, 'Los apellidos del tarjetahabiente son obligatorios'),
    cargo: z.string().trim().min(1, 'El cargo del tarjetahabiente es obligatorio'),
    email: z.string().trim().min(1, 'El correo del tarjetahabiente es obligatorio'),
    telefono: z.string().trim().min(1, 'El teléfono del tarjetahabiente es obligatorio'),
  }),
  cupo: z.object({
    solicitado: z.number().positive('El cupo solicitado debe ser mayor a cero'),
    disponibleCec: z.number().nonnegative().optional(),
  }),
  entrega: z.object({
    tipo: z.enum(['courier', 'comercial']),
    ciudad: z.string().trim().min(1, 'La ciudad de entrega es obligatoria'),
    direccion: z.string().trim().min(1, 'La dirección de entrega es obligatoria'),
    fechaAgendamiento: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha de agendamiento debe tener formato YYYY-MM-DD'),
  }),
  camaraComercio: z.object({
    archivoNombre: z.string().trim().min(1, 'Debe indicar el archivo de Cámara de Comercio'),
    nitCertificado: z.string().trim().optional(),
    fechaExpedicion: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
  }),
  producto: z.object({
    codigo: z.string().trim().min(1, 'El código de producto es obligatorio'),
    franquicia: z.string().trim().min(1, 'La franquicia es obligatoria'),
  }),
  asesorId: z.string().trim().min(1).optional(),
});

export type SubmitPowerAppDto = z.infer<typeof submitPowerAppSchema>;
