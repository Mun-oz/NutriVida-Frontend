import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import userEvent from '@testing-library/user-event';
import Contacto from './Contacto';
import NuevoCatalogoAdmin from './admin/NuevoCatalogoAdmin';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { crearServicio } from '../services/serviciosService';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    accessToken: 'token-de-prueba'
  })
}));

vi.mock('../services/serviciosService', () => ({
  crearServicio: vi.fn()
}));

window.alert = vi.fn();
const mockedUseNavigate = vi.fn();

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockedUseNavigate,
  };
});

describe('Pruebas de Formularios Secundarios', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Formulario de Contacto', () => {
    it('debe enviar el mensaje y redirigir a la vista de gracias', async () => {
      const user = userEvent.setup();
      render(<MemoryRouter><Contacto /></MemoryRouter>);

      // 1. Llenamos los campos
      await user.type(screen.getByLabelText(/Nombre Completo/i), 'Marcelo Muñoz');
      await user.type(screen.getByLabelText(/Teléfono/i), '912345678'); 
      await user.type(screen.getByLabelText(/Correo Electrónico/i), 'marcelo@ejemplo.com');
      
      const selectAsunto = screen.getByRole('combobox');
      await user.selectOptions(selectAsunto, 'Dudas sobre planes');

      await user.type(screen.getByLabelText(/Comentario/i), 'Consulta general');

      // 2. Forzamos el evento submit
      const btnSubmit = screen.getByRole('button', { name: /Enviar Mensaje/i });
      const form = btnSubmit.closest('form');
      fireEvent.submit(form);

      // 3. Verificamos la navegación correcta programada en Contacto.jsx
      expect(mockedUseNavigate).toHaveBeenCalledWith('/gracias', { state: { tipo: 'contacto' } });
    });
  });

  describe('Formulario de Nuevo Servicio Admin', () => {

  it('debe guardar el servicio y redirigir al catálogo con banner', async () => {
    const user = userEvent.setup();

    crearServicio.mockResolvedValue({
      id: 2,
      codigo: 'NV002',
      nombre: 'Plan Nutricional',
      precio: 25000
    });

    render(
      <MemoryRouter>
        <NuevoCatalogoAdmin />
      </MemoryRouter>
    );

    await user.type(
      screen.getByLabelText(/Código del Servicio/i),
      'NV002'
    );

    await user.type(
      screen.getByLabelText(/Nombre del Servicio/i),
      'Plan Nutricional'
    );

    await user.type(
      screen.getByLabelText(/Descripción/i),
      'Plan detallado'
    );

    await user.type(
      screen.getByLabelText(/Precio/i),
      '25000'
    );

    fireEvent.submit(
      screen.getByRole('button', {
        name: /Guardar Servicio/i
      }).closest('form')
    );

    await waitFor(() => {
      expect(crearServicio).toHaveBeenCalledWith(
        expect.objectContaining({
          codigo: 'NV002',
          nombre: 'Plan Nutricional',
          precio: 25000
        }),
        'token-de-prueba'
      );

      expect(mockedUseNavigate).toHaveBeenCalledWith(
        '/admin/catalogo',
        {
          state: {
            mensaje: 'Servicio registrado correctamente.'
          }
        }
      );
    });
  });

});
});