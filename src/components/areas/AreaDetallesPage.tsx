import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AreaDetalles from './AreaDetalles';
import { useArea } from '../../hooks/features/useArea';
import { useUserContext } from '../../context/UserContext';
import { useCamarasContext } from '../../context/CamarasContext';
import type { Area, User } from '../../types/entities';
import ConfirmDialog from '../shared/ConfirmDialog';
import AreaForm from './AreaForm';
import { obraUsuarioService } from '../../services/obraUsuario';

const AreaDetallesPage: React.FC = () => {
  const { areaId } = useParams<{ areaId: string }>();
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { camaras } = useCamarasContext();
  const numericAreaId = Number(areaId);

  const isCoordinador = user?.global_role === 'coordinador';

  const { getById, updateArea, deleteArea, error: areaError } = useArea();


  const [area, setArea] = useState<Area | null>(null);
  const [loading, setLoading] = useState(true);
  const error = areaError || (loading ? null : !area ? 'Área no encontrada' : null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [supervisores, setSupervisores] = useState<User[]>([]);
  const handleOpenEditModal = () => setIsEditModalOpen(true);

  // Handler para cerrar el modal
  const handleCloseEditModal = () => setIsEditModalOpen(false);
  const handleSubmitEdit = async (areaData: Area | Omit<Area, 'id_area'>) => {
    setIsSubmitting(true);
    try {
      if ('id_area' in areaData) {
        const success = await updateArea(areaData);
        if (success) {
          const updated = await getById(areaData.id_area);
          if (updated) setArea(updated);
          setIsEditModalOpen(false);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cargar el área al montar
  useEffect(() => {
    const loadArea = async () => {
      setLoading(true);
      try {
        const data = await getById(numericAreaId);
        setArea(data || null);
      } catch {
        // El error ya está manejado por el contexto
      } finally {
        setLoading(false);
      }
    };

    if (numericAreaId) loadArea();
  }, [numericAreaId, getById]);

  useEffect(() => {
    // Cargar supervisores de la obra solo si hay área cargada
    if (area?.id_obra) {
      obraUsuarioService.getSupervisoresConAreas(area.id_obra)
        .then(data => {
          // Mapear a User[]
          setSupervisores(data.map(s => ({
            id_usuario: s.id_usuario,
            usuario: '',
            auth_provider: 'local',
            correo: s.correo,
            nombres: s.nombres,
            apellidos: s.apellidos,
            global_role: 'supervisor',
          })));
        })
        .catch(() => setSupervisores([]));
    }
  }, [area?.id_obra]);

  const handleBack = () => navigate(-1);

  const handleEdit = async (areaData: Area) => {
    const success = await updateArea(areaData);
    if (success) {
      const updated = await getById(areaData.id_area);
      if (updated) setArea(updated);
    }
  };

  const handleDelete = async (id: number) => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    const success = await deleteArea(numericAreaId);
    setIsDeleting(false);
    if (success) {
      navigate('/obras');
    }
    setShowDeleteModal(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !area) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="p-6 bg-red-50 border border-red-200 rounded-md">
          <h2 className="text-lg font-medium text-red-800">Error al cargar el área</h2>
          <p className="mt-2 text-sm text-red-700">
            {error || 'No se pudo cargar la información del área. Por favor, intenta de nuevo.'}
          </p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-6">
      <AreaDetalles
        area={{
          ...area,
          supervisor: area.id_usuario
            ? supervisores.find(s => s.id_usuario === area.id_usuario)
            : undefined,
          camaras_count: camaras.filter(c => c.id_area === area.id_area).length,
        }}
        isCoordinador={isCoordinador}
        onBack={handleBack}
        onEdit={isCoordinador ? handleOpenEditModal : undefined}
        onDelete={isCoordinador ? handleDelete : undefined}
      />
      {showDeleteModal && (
        <ConfirmDialog
          title="Eliminar área"
          message={`¿Estás seguro de que deseas eliminar el área "${area.nombre}"? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          isLoading={isDeleting}
          variant="danger"
        />)}
      {isEditModalOpen && area && (
        <AreaForm
          onClose={handleCloseEditModal}
          obraId={area.id_obra}
          areaToEdit={area}
          onSubmit={handleSubmitEdit}
          isLoading={isSubmitting}
          supervisores={supervisores}
          isCoordinador={isCoordinador}
        />
      )}
    </div>
  );
};

export default AreaDetallesPage;
