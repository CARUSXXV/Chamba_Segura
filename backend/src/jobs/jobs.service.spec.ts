import { Test, TestingModule } from '@nestjs/testing';
import { JobsService } from './jobs.service';
import { SupabaseClient } from '@supabase/supabase-js';

describe('JobsService Geolocation', () => {
  let service: JobsService;
  let mockSupabase: any;

  beforeEach(async () => {
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      rpc: jest.fn().mockResolvedValue({ data: [], error: null }),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        {
          provide: SupabaseClient,
          useValue: mockSupabase,
        },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
  });

  it('should call rpc when latitude and longitude are provided in search', async () => {
    const filters = {
      latitude: 10.5,
      longitude: -66.9,
      radius: 10000,
    };

    mockSupabase.rpc.mockResolvedValueOnce({
      data: [
        {
          id: '1',
          title: 'Trabajo Cerca',
          contractor_id: 'u1',
          perfil_nombre_completo: 'Test User',
          perfil_foto_url: null,
          distancia_metros: 500,
        },
      ],
      error: null,
    });

    const result = await service.searchJobs(filters);

    expect(mockSupabase.rpc).toHaveBeenCalledWith('buscar_trabajos_cercanos', {
      lat: 10.5,
      long: -66.9,
      radio_metros: 10000,
      categoria: null,
      habilidades: null,
    });
    expect(result.data[0].distancia_metros).toBe(500);
    expect(result.data[0].perfiles.nombre_completo).toBe('Test User');
  });

  it('should format location as WKT POINT during creation', async () => {
    const payload: any = {
      title: 'Nuevo Trabajo',
      description: 'Desc',
      category: 'Otros',
      contractor_id: 'u1',
      latitude: 10.5,
      longitude: -66.9,
    };

    mockSupabase.insert.mockReturnValueOnce({
      select: jest.fn().mockResolvedValueOnce({ data: [{ id: '1' }], error: null }),
    });

    await service.createJob(payload);

    expect(mockSupabase.insert).toHaveBeenCalledWith([
      expect.objectContaining({
        ubicacion: 'POINT(-66.9 10.5)',
      }),
    ]);
  });
});
