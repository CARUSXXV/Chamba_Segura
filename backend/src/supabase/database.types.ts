export interface ProfilesRow {
    id: string;
    nombre_completo?: string | null;
    username?: string | null;
    email_contacto?: string | null;
    telefono?: string | null;
    foto_url?: string | null;
    contractor_id?: string | null;
    creado_el?: string | null;
    rating_promedio?: number | null;
    total_calificaciones?: number | null;
    ubicacion?: any | null;
}

export interface ServiciosRow {
    perfiles?: {
        nombre_completo?: string | null;
        foto_url?: string | null;
        rating_promedio?: number | null;
        total_calificaciones?: number | null;
    } | null;

    trabajador_id?: string | null;
    oficio?: string | null;
    tipo_de_oficio?: string | null;
    descripcion?: string | null;
    tarifa_promedio?: number | null;
    firma_contrato?: boolean | null;
    ubicacion?: any | null;
    trabajador?: {
        nombre_completo?: string | null;
        foto_url?: string | null;
        rating_promedio?: number | null;
        total_calificaciones?: number | null;
    } | null;

    cliente?: {
        nombre_completo?: string | null;
    } | null;

    trabajo?: {
        title?: string | null;
        description?: string | null;
    } | null;

    resenas?: ResenasRow[] | null;
}

export interface ServicioDetails extends ServiciosRow {
    perfiles?: {
        nombre_completo?: string | null;
        foto_url?: string | null;
    } | null;
    distancia_metros?: number;
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
    perfiles?: {
        nombre_completo?: string | null;
        foto_url?: string | null;
        rating_promedio?: number | null;
        total_calificaciones?: number | null;
    } | null;

    trabajador?: {
        nombre_completo?: string | null;
        foto_url?: string | null;
        rating_promedio?: number | null;
        total_calificaciones?: number | null;
    } | null;

    id: string;
    title: string;
    description: string;
    category: string;
    required_skills?: string[];
    budget?: number;
    contractor_id: string;
    enviado_el: string;
    ubicacion?: any | null;
    distancia_metros?: number;
}
export interface ResenasRow {
    id: string;
    contrataciones_id: string;
    calificacion: number;
    comentario: string | null;
    afecta_racha: boolean | null;
    evaluador_id: string;
    evaluado_id: string;
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

export interface FakeTransactionsRow {
    id: string;
    amount: number;
    currency: string;
    status: string;
    error_code: string | null;
    description: string | null;
    reference: string | null;
    last_four: string;
    card_brand: string | null;
    full_name: string;
    contrataciones_id: string | null;
    created_at: string;
}

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: ProfilesRow;
                Insert: Partial<ProfilesRow>;
                Update: Partial<ProfilesRow>;
                Relationships: [];
            };
            servicios: {
                Row: ServiciosRow;
                Insert: Partial<ServiciosRow>;
                Update: Partial<ServiciosRow>;
                Relationships: [];
            };
            contrataciones: {
                Row: ContratacionesRow;
                Insert: Partial<ContratacionesRow>;
                Update: Partial<ContratacionesRow>;
                Relationships: [];
            };
            jobs: {
                Row: JobsRow;
                Insert: Partial<JobsRow>;
                Update: Partial<JobsRow>;
                Relationships: [];
            };
            resenas: {
                Row: ResenasRow;
                Insert: Partial<ResenasRow> &
                Pick<ResenasRow, 'id' | 'contrataciones_id' | 'calificacion' | 'comentario' | 'afecta_racha' | 'evaluador_id' | 'evaluado_id'>;
                Update: Partial<ResenasRow>;
                Relationships: [];
            };
            chats: {
                Row: ChatsRow;
                Insert: Partial<ChatsRow>;
                Update: Partial<ChatsRow>;
                Relationships: [];
            };
            mensajes: {
                Row: MensajesRow;
                Insert: Partial<MensajesRow>;
                Update: Partial<MensajesRow>;
                Relationships: [];
            };
            fake_transactions: {
                Row: FakeTransactionsRow;
                Insert: Partial<FakeTransactionsRow>;
                Update: Partial<FakeTransactionsRow>;
                Relationships: [];
            };
        };
        Views: Record<string, never>;
        Functions: Record<string, never>;
    };
};
