export interface ProfilesRow {
  id: string;
  nombre_completo?: string | null;
  username?: string | null;
  email_contacto?: string | null;
  telefono?: string | null;
  foto_url?: string | null;
  contractor_id?: string | null;
  creado_el?: string | null;
}

export interface ServiciosRow {
  id: string;
  trabajador_id: string;
  oficio: string;
  tipo_de_oficio: string | null;
  descripcion: string | null;
  firma_contrato: boolean | null;
  tarifa_promedio: number | null;
  actualizado_el: string | null;
}

export interface ServicioDetails extends ServiciosRow {
  perfiles?: {
    nombre_completo?: string | null;
    foto_url?: string | null;
  } | null;
}

export interface ContratacionesRow {
  id: string;
  cliente_id: string;
  servicios_id: string;
  job_id?: string | null;
  estado_contrato: string | null;
  fecha_calendario: string | null;
  precio_final: number | null;
  documento_contrato_url: string | null;
}

export interface ContratacionesWithRelations extends ContratacionesRow {
  servicio?: {
    trabajador_id?: string | null;
    oficio?: string | null;
    firma_contrato?: boolean | null;
  } | null;
  cliente?: {
    nombre_completo?: string | null;
  } | null;
  trabajo?: {
    title?: string | null;
    description?: string | null;
  } | null;
}

export interface JobsRow {
  id: string;
  title?: string | null;
  description?: string | null;
  category?: string | null;
  required_skills?: string[] | null;
  budget?: number | null;
  contractor_id?: string | null;
}

export interface PostulacionesRow {
  id: string;
  job: string;
  trabajador_id: string;
  mensaje: string | null;
  estado: string | null;
  created_at: string | null;
}

export interface PostulacionesWithRelations extends PostulacionesRow {
  trabajo?:
    | (JobsRow & {
        perfiles?: {
          nombre_completo?: string | null;
          foto_url?: string | null;
        } | null;
      })
    | null;
  trabajador?: {
    nombre_completo?: string | null;
    foto_url?: string | null;
  } | null;
}

export interface ChatsRow {
  id: string;
  cliente_id: string;
  trabajador_id: string;
  job_id: string;
  creado_el: string;
}

export interface MensajesRow {
  id: string;
  chat_id: string;
  emisor_id: string;
  contenido: string;
  enviado_el: string;
}

export interface Database {
  public: {
    Tables: {
      perfiles: {
        Row: ProfilesRow;
        Insert: Partial<ProfilesRow> & Pick<ProfilesRow, 'id'>;
        Update: Partial<ProfilesRow>;
        Relationships: [];
      };
      servicios: {
        Row: ServiciosRow;
        Insert: Omit<
          ServiciosRow,
          'id' | 'actualizado_el' | 'firma_contrato'
        > & {
          id?: string;
          actualizado_el?: string | null;
          firma_contrato?: boolean | null;
        };
        Update: Partial<ServiciosRow>;
        Relationships: [];
      };
      contrataciones: {
        Row: ContratacionesRow;
        Insert: Omit<ContratacionesRow, 'id' | 'estado_contrato'> & {
          id?: string;
          estado_contrato?: string | null;
        };
        Update: Partial<ContratacionesRow>;
        Relationships: [];
      };
      jobs: {
        Row: JobsRow;
        Insert: Partial<JobsRow> & Pick<JobsRow, 'id'>;
        Update: Partial<JobsRow>;
        Relationships: [];
      };
      postulaciones: {
        Row: PostulacionesRow;
        Insert: Omit<PostulacionesRow, 'id' | 'created_at' | 'estado'> & {
          id?: string;
          created_at?: string | null;
          estado?: string | null;
        };
        Update: Partial<PostulacionesRow>;
        Relationships: [];
      };
      chats: {
        Row: ChatsRow;
        Insert: Partial<ChatsRow> &
          Pick<ChatsRow, 'id' | 'cliente_id' | 'trabajador_id' | 'job_id'>;
        Update: Partial<ChatsRow>;
        Relationships: [];
      };
      mensajes: {
        Row: MensajesRow;
        Insert: Partial<MensajesRow> &
          Pick<MensajesRow, 'id' | 'chat_id' | 'emisor_id' | 'contenido'>;
        Update: Partial<MensajesRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
