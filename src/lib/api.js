// api.js — VERSIÓN PHP+MYSQL (unificada, 14 áreas migradas)
// Reemplaza a la versión de Supabase para todo lo que ya construimos. El
// resto de funciones (ver lista de pendientes al final del archivo) todavía
// no existen — si tocás algo que las use, vas a ver un error "no es una función".

const API_BASE = "https://forhumanaco.com/api";

async function llamarAPI(endpoint, opciones = {}) {
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    credentials: "include",
    headers: opciones.body ? { "Content-Type": "application/json" } : undefined,
    ...opciones,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Error en ${endpoint}`);
  return data;
}
const post = (endpoint, body) => llamarAPI(endpoint, { method: "POST", body: JSON.stringify(body) });

/* ==================== AUTENTICACIÓN ==================== */
export async function loginProfesor(email, password) { return post("login_profesor.php", { email, password }); }
export async function logoutProfesor() { return post("logout.php", {}); }
export async function whoamiProfesor() { return llamarAPI("whoami.php"); }
export async function fetchUsuarioActualId() { const yo = await whoamiProfesor(); return yo.logueado ? yo.id : null; }

/* ==================== GRADOS / REINOS ==================== */
export async function fetchGrados() { return llamarAPI("grados_list.php"); }
// Catálogo de Reinos: todavía no migrado — devuelve vacío para no romper
// las tarjetas (usan un color por defecto cuando no encuentran el reino).
export async function fetchReinos() { return []; }

/* ==================== ESTUDIANTES ==================== */
export async function fetchEstudiantesPorGrado(gradoId) { return llamarAPI(`estudiantes_list.php?grado_id=${encodeURIComponent(gradoId)}`); }
export async function crearEstudiante(nombre, gradoId, reinoActual) { return post("estudiantes_crear.php", { nombre, grado_id: gradoId, reino_actual: reinoActual }); }
export async function quitarEstudiante(id) { return post("estudiantes_quitar.php", { id }); }
export async function restaurarEstudiante(id) { return post("estudiantes_restaurar.php", { id }); }
export async function eliminarEstudiantePermanente(id) { return post("estudiantes_eliminar_permanente.php", { id }); }
export async function fetchEstudiantesInactivos() { return llamarAPI("estudiantes_inactivos.php"); }
export async function consultarPortalEstudiante(codigo) { return llamarAPI(`estudiante_login.php?codigo=${encodeURIComponent(codigo)}`); }
export async function fetchEstudiantePorNombreYGrado(nombre, gradoId) { return llamarAPI(`estudiante_por_nombre_grado.php?nombre=${encodeURIComponent(nombre)}&grado_id=${encodeURIComponent(gradoId)}`); }

/* ==================== MATERIAS ==================== */
export async function fetchMaterias() { return llamarAPI("materias_list.php"); }
export async function crearMateria(nombre) { return post("materias_crear.php", { nombre }); }
export async function eliminarMateria(id) { return post("materias_eliminar.php", { id }); }

/* ==================== CALIFICACIONES (config, categorías, actividades, valores, finales) ==================== */
export async function fetchNotasConfig(materiaId) { return llamarAPI(`notas_config_get.php?materia_id=${materiaId}`); }
export async function guardarNotasConfig(materiaId, config) { return post("notas_config_guardar.php", { materia_id: materiaId, ...config }); }
export async function fetchCategorias(materiaId) { return llamarAPI(`categorias_list.php?materia_id=${materiaId}`); }
export async function crearCategoria(materiaId, nombre, porcentaje) { return post("categorias_crear.php", { materia_id: materiaId, nombre, porcentaje }); }
export async function eliminarCategoria(id) { return post("categorias_eliminar.php", { id }); }
export async function fetchActividades(materiaId, gradoId, periodo) { return llamarAPI(`actividades_list.php?materia_id=${materiaId}&grado_id=${encodeURIComponent(gradoId)}&periodo=${encodeURIComponent(periodo)}`); }
export async function crearActividad(campos) { return post("actividades_crear.php", campos); }
export async function editarActividad(id, campos) { return post("actividades_editar.php", { id, ...campos }); }
export async function eliminarActividad(id) { return post("actividades_eliminar.php", { id }); }
export async function fetchValores(actividadIds) { if (!actividadIds?.length) return []; return llamarAPI(`valores_list.php?actividad_ids=${actividadIds.join(",")}`); }
export async function setValor(actividadId, estudianteId, valor) { return post("valor_guardar.php", { actividad_id: actividadId, estudiante_id: estudianteId, valor }); }
export async function setObservacionValor(actividadId, estudianteId, observacion) { return post("valor_observacion_guardar.php", { actividad_id: actividadId, estudiante_id: estudianteId, observacion }); }
export async function fetchNotasFinales(materiaId) { return llamarAPI(`notas_finales_list.php?materia_id=${materiaId}`); }
export async function guardarNotaFinal(materiaId, estudianteId, periodo, nota) { return post("nota_final_guardar.php", { materia_id: materiaId, estudiante_id: estudianteId, periodo, nota }); }
export async function eliminarNotaFinalPeriodo(materiaId, estudianteId, periodo) { return post("nota_final_eliminar.php", { materia_id: materiaId, estudiante_id: estudianteId, periodo }); }

/* ==================== RÚBRICAS ==================== */
export async function fetchRubricasCatalogo() { return llamarAPI("rubricas_catalogo_list.php"); }
export async function crearRubricaCatalogo(nombre, criterios) { return post("rubricas_catalogo_crear.php", { nombre, criterios }); }
export async function editarRubricaCatalogo(id, campos) { return post("rubricas_catalogo_editar.php", { id, ...campos }); }
export async function eliminarRubricaCatalogo(id) { return post("rubricas_catalogo_eliminar.php", { id }); }
export async function guardarRubricaActividad(actividadId, criterios) { return post("actividad_rubrica_guardar.php", { actividad_id: actividadId, criterios }); }

/* ==================== ASISTENCIA ==================== */
export async function fetchAsistenciaFecha(estudianteIds, fecha, materiaId) {
  if (!estudianteIds?.length) return {};
  const mat = materiaId === null || materiaId === undefined ? "" : `&materia_id=${materiaId}`;
  return llamarAPI(`asistencia_fecha_get.php?estudiante_ids=${estudianteIds.join(",")}&fecha=${fecha}${mat}`);
}
export async function marcarAsistencia(estudianteId, fecha, codigo, observacion, materiaId) { return post("asistencia_marcar.php", { estudiante_id: estudianteId, fecha, codigo, observacion, materia_id: materiaId }); }
export async function quitarAsistencia(estudianteId, fecha, materiaId) { return post("asistencia_quitar.php", { estudiante_id: estudianteId, fecha, materia_id: materiaId }); }
export async function marcarTodosPresentes(estudianteIds, fecha, materiaId) { return post("asistencia_marcar_todos.php", { estudiante_ids: estudianteIds, fecha, materia_id: materiaId }); }
export async function fetchTotalesAsistenciaPorGrado(desde, hasta, materiaId) {
  const p = new URLSearchParams(); if (desde) p.set("desde", desde); if (hasta) p.set("hasta", hasta); if (materiaId != null) p.set("materia_id", materiaId);
  return llamarAPI(`asistencia_totales_grado.php?${p}`);
}
export async function fetchTotalesAsistenciaPorEstudiante(desde, hasta, materiaId) {
  const p = new URLSearchParams(); if (desde) p.set("desde", desde); if (hasta) p.set("hasta", hasta); if (materiaId != null) p.set("materia_id", materiaId);
  return llamarAPI(`asistencia_totales_estudiante.php?${p}`);
}
export async function fetchAsistenciaConsolidadaEstudiante(estudianteId) { return llamarAPI(`asistencia_consolidada_estudiante.php?estudiante_id=${estudianteId}`); }

/* ==================== PLANEACIONES ==================== */
export async function fetchUnidades(materiaId, gradoId, periodo) { return llamarAPI(`planeaciones_unidades.php?materia_id=${materiaId}&grado_id=${encodeURIComponent(gradoId)}&periodo=${encodeURIComponent(periodo)}`); }
export async function fetchClases(unidadId) { return llamarAPI(`planeaciones_clases.php?unidad_id=${unidadId}`); }
export async function fetchTodasLasClases(materiaId, gradoId, periodo) { return llamarAPI(`planeaciones_todas_clases.php?materia_id=${materiaId}&grado_id=${encodeURIComponent(gradoId)}&periodo=${encodeURIComponent(periodo)}`); }
export async function crearPlaneacion(campos) { return post("planeaciones_crear.php", campos); }
export async function crearUnidadConClases(unidad, clases) { return post("planeaciones_crear_unidad_con_clases.php", { unidad, clases }); }
export async function editarPlaneacion(id, campos) { return post("planeaciones_editar.php", { id, ...campos }); }
export async function eliminarPlaneacion(id) { return post("planeaciones_eliminar.php", { id }); }
export async function fetchDictados(claseId) { return llamarAPI(`dictados_list.php?clase_id=${claseId}`); }
export async function fetchDictadosPendientes(materiaId) { return llamarAPI(`dictados_pendientes.php?materia_id=${materiaId}`); }
export async function crearDictado(claseId, gradoId, fecha, estado) { return post("dictados_crear.php", { clase_id: claseId, grado_id: gradoId, fecha, estado }); }
export async function editarDictado(id, campos) { return post("dictados_editar.php", { id, ...campos }); }
export async function eliminarDictado(id) { return post("dictados_eliminar.php", { id }); }
export async function fetchEstandares(tipo) { return llamarAPI(`estandares_list.php?tipo=${tipo}`); }
export async function crearEstandar(campos) { return post("estandares_crear.php", campos); }
export async function editarEstandar(id, campos) { return post("estandares_editar.php", { id, ...campos }); }
export async function eliminarEstandar(id) { return post("estandares_eliminar.php", { id }); }
export async function fetchEstandaresDePlaneacion(planeacionId) { return llamarAPI(`estandares_de_planeacion.php?planeacion_id=${planeacionId}`); }
export async function vincularEstandar(planeacionId, estandarId) { return post("estandares_vincular.php", { planeacion_id: planeacionId, estandar_id: estandarId }); }
export async function desvincularEstandar(planeacionId, estandarId) { return post("estandares_desvincular.php", { planeacion_id: planeacionId, estandar_id: estandarId }); }
export async function fetchRecursos(planeacionId) { return llamarAPI(`recursos_list.php?planeacion_id=${planeacionId}`); }
export async function crearRecurso(planeacionId, url, titulo) { return post("recursos_crear.php", { planeacion_id: planeacionId, url, titulo }); }
export async function eliminarRecurso(id) { return post("recursos_eliminar.php", { id }); }
export async function fetchTareas(planeacionId) { return llamarAPI(`tareas_list.php?planeacion_id=${planeacionId}`); }
export async function crearTarea(campos) { return post("tareas_crear.php", campos); }
export async function editarTarea(id, campos) { return post("tareas_editar.php", { id, ...campos }); }
export async function eliminarTarea(id) { return post("tareas_eliminar.php", { id }); }
export async function fetchRubrica(tareaId) { return llamarAPI(`rubrica_get.php?tarea_id=${tareaId}`); }
export async function guardarRubrica(tareaId, criterios) { return post("rubrica_guardar.php", { tarea_id: tareaId, criterios }); }
export async function fetchInstitucion() { return llamarAPI("institucion_get.php"); }

/* ==================== OBJETOS ==================== */
export async function fetchObjetosCatalogo() { return llamarAPI("objetos_catalogo_list.php"); }
export async function crearObjeto(campos) { return post("objetos_crear.php", campos); }
export async function editarObjeto(id, campos) { return post("objetos_editar.php", { id, ...campos }); }
export async function eliminarObjeto(id) { return post("objetos_eliminar.php", { id }); }
export async function fetchInventarioEstudiante(estudianteId) { return llamarAPI(`inventario_estudiante_list.php?estudiante_id=${estudianteId}`); }
export async function comprarObjeto(estudianteId, objetoId, costo, monedasActuales) { return post("objeto_comprar.php", { estudiante_id: estudianteId, objeto_id: objetoId, costo, monedas_actuales: monedasActuales }); }
export async function usarObjeto(estudianteId, objetoId, efectoVida, nombreObjeto) { return post("objeto_usar.php", { estudiante_id: estudianteId, objeto_id: objetoId, efecto_vida: efectoVida, nombre_objeto: nombreObjeto }); }
export async function darObjetoMasivo(estudianteIds, objetoId, nombreObjeto, cantidad) { return post("objeto_dar_masivo.php", { estudiante_ids: estudianteIds, objeto_id: objetoId, nombre_objeto: nombreObjeto, cantidad }); }

/* ==================== NIVELES ==================== */
export async function fetchNivelesConfig() { return llamarAPI("niveles_config_list.php"); }
export async function fetchNivelesParaJuego() { return llamarAPI("niveles_para_juego.php"); }
export async function crearNivelConfig(nombre, xpMinimo) { return post("nivel_crear.php", { nombre, xp_minimo: xpMinimo }); }
export async function editarNivelConfig(id, campos) { return post("nivel_editar.php", { id, ...campos }); }
export async function eliminarNivelConfig(id) { return post("nivel_eliminar.php", { id }); }
export async function restablecerNivelesConfig() { return post("niveles_restablecer.php", {}); }

/* ==================== BANCO DE PREMIOS ==================== */
export async function fetchPremios() { return llamarAPI("premios_list.php"); }
export async function fetchPremiosActivos() { return llamarAPI("premios_activos_list.php"); }
export async function crearPremio(campos) { return post("premio_crear.php", campos); }
export async function editarPremio(id, campos) { return post("premio_editar.php", { id, ...campos }); }
export async function eliminarPremio(id) { return post("premio_eliminar.php", { id }); }
export async function canjearAleatorio(estudianteId) { return post("canjear_aleatorio.php", { estudiante_id: estudianteId }); }
export async function fetchCanjes() { return llamarAPI("canjes_list.php"); }
export async function marcarCanjeEntregado(id) { return post("canje_marcar_entregado.php", { id }); }

/* ==================== TABLERO SEMANAL ==================== */
export async function fetchTableroSemanal(gradosIds, periodo) { return llamarAPI(`tablero_semanal_list.php?grado_ids=${gradosIds.join(",")}&periodo=${periodo}`); }
export async function fetchConteoTablero(gradosIds, periodo) { const r = await llamarAPI(`tablero_semanal_conteo.php?grado_ids=${gradosIds.join(",")}&periodo=${periodo}`); return r.conteo; }
export async function guardarCeldaTablero(gradoId, periodo, semana, campos) { return post("tablero_celda_guardar.php", { grado_id: gradoId, periodo, semana, ...campos }); }
export async function eliminarCeldaTablero(gradoId, periodo, semana) { return post("tablero_celda_eliminar.php", { grado_id: gradoId, periodo, semana }); }
export async function eliminarSemanaTablero(gradosIds, periodo, semana) { return post("tablero_semana_eliminar.php", { grados_ids: gradosIds, periodo, semana }); }
export async function moverTableroAPeriodo(gradosIds, periodoOrigen, periodoDestino) { return post("tablero_mover_periodo.php", { grados_ids: gradosIds, periodo_origen: periodoOrigen, periodo_destino: periodoDestino }); }

/* ==================== ACTIVIDADES PROGRAMADAS ==================== */
export async function fetchActividadesProgramadas() { return llamarAPI("actividades_programadas_list.php"); }
export async function crearActividadProgramada(campos, cursos) { return post("actividad_programada_crear.php", { ...campos, cursos }); }
export async function editarActividadProgramada(id, campos) { return post("actividad_programada_editar.php", { id, ...campos }); }
export async function eliminarActividadProgramada(id) { return post("actividad_programada_eliminar.php", { id }); }
export async function actualizarCursosActividadProgramada(actividadProgramadaId, cursos) { return post("actividad_programada_actualizar_cursos.php", { actividad_programada_id: actividadProgramadaId, cursos }); }
export async function aplicarRecompensasRetroactivas(actividadProgramadaId) { return post("aplicar_recompensas_retroactivas.php", { actividad_programada_id: actividadProgramadaId }); }

/* ==================== INCLUSIÓN ==================== */
export async function fetchEstudiantesEnInclusion() { return llamarAPI("estudiantes_en_inclusion.php"); }
export async function guardarInclusion(estudianteId, campos) { return post("inclusion_guardar.php", { estudiante_id: estudianteId, ...campos }); }
export async function fetchInclusionInfo(estudianteId) { return llamarAPI(`inclusion_info_get.php?estudiante_id=${estudianteId}`); }
export async function fetchInclusionInfoMultiples(estudianteIds) { return llamarAPI(`inclusion_info_multiples.php?estudiante_ids=${estudianteIds.join(",")}`); }
export async function guardarInclusionInfo(estudianteId, campos) { return post("inclusion_info_guardar.php", { estudiante_id: estudianteId, ...campos }); }
export async function fetchSeguimientosInclusion(estudianteId) { return llamarAPI(`seguimientos_inclusion_list.php?estudiante_id=${estudianteId}`); }
export async function fetchSeguimientosInclusionMultiples(estudianteIds) { return llamarAPI(`seguimientos_inclusion_multiples.php?estudiante_ids=${estudianteIds.join(",")}`); }
export async function crearSeguimientoInclusion(estudianteId, materiaId, tipo, observacion) { return post("seguimiento_inclusion_crear.php", { estudiante_id: estudianteId, materia_id: materiaId, tipo, observacion }); }
export async function eliminarSeguimientoInclusion(id) { return post("seguimiento_inclusion_eliminar.php", { id }); }

/* ==================== GUÍAS DE ESTUDIO ==================== */
export const PROMPT_IA_GUIAS_DEFAULT = "Generá una guía de estudio completa para el tema que te indique, en formato JSON con los campos: titulo, proposito_general, objetivo, contenido, conceptos_clave (array), fase_exploracion, fase_aplicacion, fase_transferencia, preguntas_reflexion (array).";
export async function fetchGuiasEstudio(materiaId, gradoId, periodo) { return llamarAPI(`guias_estudio_list.php?materia_id=${materiaId}&grado_id=${encodeURIComponent(gradoId)}&periodo=${encodeURIComponent(periodo)}`); }
export async function fetchGuiasEstudioParaGrado(gradoId) { return llamarAPI(`guias_estudio_para_grado.php?grado_id=${encodeURIComponent(gradoId)}`); }
export async function crearGuiaEstudio(campos) { return post("guia_estudio_crear.php", campos); }
export async function editarGuiaEstudio(id, campos) { return post("guia_estudio_editar.php", { id, ...campos }); }
export async function eliminarGuiaEstudio(id) { return post("guia_estudio_eliminar.php", { id }); }
export async function fetchAutoevaluacionGuia(guiaId, estudianteId) { return llamarAPI(`autoevaluacion_guia_get.php?guia_id=${guiaId}&estudiante_id=${estudianteId}`); }
export async function guardarAutoevaluacionGuia(guiaId, estudianteId, respuestas) { return post("autoevaluacion_guia_guardar.php", { guia_id: guiaId, estudiante_id: estudianteId, respuestas }); }
export async function fetchPromptIaGuias() { return llamarAPI("prompt_ia_guias_get.php"); }
export async function guardarPromptIaGuias(texto) { return post("prompt_ia_guias_guardar.php", { texto }); }

/* ==================== EVALUACIONES / MISIONES ==================== */
export async function fetchEvaluaciones(materiaId, gradoId, periodo) { return llamarAPI(`evaluaciones_list.php?materia_id=${materiaId}&grado_id=${encodeURIComponent(gradoId)}&periodo=${encodeURIComponent(periodo)}`); }
export async function crearEvaluacion(campos) { return post("evaluacion_crear.php", campos); }
export async function editarEvaluacion(id, campos) { return post("evaluacion_editar.php", { id, ...campos }); }
export async function eliminarEvaluacion(id) { return post("evaluacion_eliminar.php", { id }); }
export async function copiarEvaluacion(evaluacionId, materiaDestinoId, gradoDestinoId, periodoDestino) { return post("evaluacion_copiar.php", { evaluacion_id: evaluacionId, materia_destino_id: materiaDestinoId, grado_destino_id: gradoDestinoId, periodo_destino: periodoDestino }); }
export async function fetchPreguntasDocente(evaluacionId) { return llamarAPI(`preguntas_evaluacion_list.php?evaluacion_id=${evaluacionId}`); }
export async function crearPreguntaConBanco(campos, guardarEnBanco, materiaId, temaBanco, nivel) { return post("pregunta_crear_con_banco.php", { campos, guardar_en_banco: guardarEnBanco, materia_id: materiaId, tema_banco: temaBanco, nivel }); }
export async function editarPregunta(id, campos) { return post("pregunta_editar.php", { id, ...campos }); }
export async function eliminarPregunta(id) { return post("pregunta_eliminar.php", { id }); }
export async function fetchTemasBanco(materiaId, nivel) { const n = nivel ? `&nivel=${nivel}` : ""; return llamarAPI(`banco_temas_list.php?materia_id=${materiaId}${n}`); }
export async function agregarPreguntasAleatoriasDesdeBanco(evaluacionId, materiaId, tema, nivel, cantidad, ordenInicial) { return post("banco_agregar_aleatorias.php", { evaluacion_id: evaluacionId, materia_id: materiaId, tema, nivel, cantidad, orden_inicial: ordenInicial }); }
export async function fetchIntentosDeEvaluacion(evaluacionId) { return llamarAPI(`intentos_evaluacion_list.php?evaluacion_id=${evaluacionId}`); }
export async function fetchRespuestasDeIntento(intentoId) { return llamarAPI(`respuestas_intento_list.php?intento_id=${intentoId}`); }
export async function calificarRespuesta(respuestaId, puntos, correcta) { return post("respuesta_calificar.php", { id: respuestaId, puntos, correcta }); }
export async function recalcularPuntajeIntento(intentoId) { return post("intento_recalcular_puntaje.php", { id: intentoId }); }
export async function publicarResultado(intentoId, visible) { return post("intento_publicar.php", { intento_id: intentoId, visible }); }
export async function publicarTodosLosResultados(evaluacionId) { return post("intentos_publicar_todos.php", { evaluacion_id: evaluacionId }); }
export async function eliminarIntento(id) { return post("intento_eliminar.php", { id }); }
export async function fetchEvaluacionesDisponibles(gradoId) { return llamarAPI(`evaluaciones_disponibles.php?grado_id=${encodeURIComponent(gradoId)}`); }
export async function iniciarIntentoConAleatorias(evaluacion, estudianteId) { return post("intento_iniciar_aleatorio.php", { evaluacion_id: evaluacion.id, estudiante_id: estudianteId }); }
export async function entregarIntento(intentoId, payload) { return post("intento_entregar.php", { intento_id: intentoId, payload }); }

/* ==================== PROYECTOS / LA FORJA ==================== */
export async function fetchTareasCalificables(tipo, materiaId, gradoId, periodo) { return llamarAPI(`tareas_calificables_list.php?tipo=${tipo}&materia_id=${materiaId}&grado_id=${encodeURIComponent(gradoId)}&periodo=${encodeURIComponent(periodo)}`); }
export async function crearTareaCalificable(campos) { return post("tarea_calificable_crear.php", campos); }
export async function editarTareaCalificable(id, campos) { return post("tarea_calificable_editar.php", { id, ...campos }); }
export async function eliminarTareaCalificable(id) { return post("tarea_calificable_eliminar.php", { id }); }
export async function copiarTareaCalificable(tareaId, materiaDestinoId, gradoDestinoId, periodoDestino, categoriaDestinoId) { return post("tarea_calificable_copiar.php", { tarea_id: tareaId, materia_destino_id: materiaDestinoId, grado_destino_id: gradoDestinoId, periodo_destino: periodoDestino, categoria_destino_id: categoriaDestinoId }); }
export async function fetchEntregasDeTarea(tareaId) { return llamarAPI(`entregas_tarea_list.php?tarea_id=${tareaId}`); }
export async function calificarTarea(tarea, estudianteId, valor, comentario, nivelesElegidos) { return post("tarea_calificar.php", { tarea, estudiante_id: estudianteId, valor, comentario, niveles_elegidos: nivelesElegidos }); }
export async function darMonedasPorTarea(tareaId, estudianteId, cantidad) { return post("tarea_dar_monedas.php", { tarea_id: tareaId, estudiante_id: estudianteId, cantidad }); }
export async function guardarRubricaTareaCalificable(tareaId, criterios) { return post("tarea_rubrica_guardar.php", { tarea_id: tareaId, criterios }); }

/* ==================== ROLES DE CLASE ==================== */
export async function fetchRoles() { return llamarAPI("roles_list.php"); }
export async function crearRol(nombre, descripcion) { return post("rol_crear.php", { nombre, descripcion }); }
export async function editarRol(id, nombre, descripcion) { return post("rol_editar.php", { id, nombre, descripcion }); }
export async function eliminarRol(id) { return post("rol_eliminar.php", { id }); }
export async function asignarRol(estudianteId, rolId) { return post("rol_asignar.php", { estudiante_id: estudianteId, rol_id: rolId }); }

/* ==================== CONSIGNAS DEL CÓDICE + MI CÓDICE ==================== */
export async function fetchConsignasCodice() { return llamarAPI("consignas_codice_list.php"); }
export async function crearConsignaCodice(campos) { return post("consigna_codice_crear.php", campos); }
export async function editarConsignaCodice(id, campos) { return post("consigna_codice_editar.php", { id, ...campos }); }
export async function eliminarConsignaCodice(id) { return post("consigna_codice_eliminar.php", { id }); }
export async function fetchRespuestasConsigna(consignaId) { return llamarAPI(`respuestas_consigna_list.php?consigna_id=${consignaId}`); }
export async function fetchConsignasActivasParaGrado(gradoId) { return llamarAPI(`consignas_activas_grado.php?grado_id=${encodeURIComponent(gradoId)}`); }
export async function fetchEntradasCodice(estudianteId) { return llamarAPI(`entradas_codice_list.php?estudiante_id=${estudianteId}`); }
export async function crearEntradaCodice(estudianteId, campos) { return post("entrada_codice_crear_estudiante.php", { estudiante_id: estudianteId, ...campos }); }
export async function crearEntradaCodiceDocente(estudianteId, campos) { return post("entrada_codice_crear.php", { estudiante_id: estudianteId, ...campos }); }
export async function fetchComentariosCodice(entradaId) { return llamarAPI(`comentarios_codice_list.php?entrada_id=${entradaId}`); }
export async function crearComentarioCodice(entradaId, contenido) { return post("comentario_codice_crear.php", { entrada_id: entradaId, contenido }); }

/* ==================== PREGUNTADOS / TRIVIA ==================== */
export async function fetchTriviaCategorias() { return llamarAPI("trivia_categorias_list.php"); }
export async function crearTriviaCategoria(campos) { return post("trivia_categoria_crear.php", campos); }
export async function editarTriviaCategoria(id, campos) { return post("trivia_categoria_editar.php", { id, ...campos }); }
export async function eliminarTriviaCategoria(id) { return post("trivia_categoria_eliminar.php", { id }); }
export async function fetchTriviaPreguntas(categoriaId) { return llamarAPI(`trivia_preguntas_list.php?categoria_id=${categoriaId}`); }
export async function crearTriviaPregunta(campos) { return post("trivia_pregunta_crear.php", campos); }
export async function editarTriviaPregunta(id, campos) { return post("trivia_pregunta_editar.php", { id, ...campos }); }
export async function eliminarTriviaPregunta(id) { return post("trivia_pregunta_eliminar.php", { id }); }
export async function importarBancoATrivia(categoriaId, materiaId, tema, nivel) { return post("importar_banco_a_trivia.php", { categoria_id: categoriaId, materia_id: materiaId, tema, nivel }); }
export async function fetchCoronasEstudiante(estudianteId) { return llamarAPI(`coronas_estudiante_list.php?estudiante_id=${estudianteId}`); }
export async function fetchPreguntaTriviaAleatoria(categoriaId, estudianteId) { return llamarAPI(`pregunta_trivia_aleatoria.php?categoria_id=${categoriaId}&estudiante_id=${estudianteId}`); }
export async function responderTrivia(estudianteId, pregunta, opcionIdx) { return post("responder_trivia.php", { estudiante_id: estudianteId, pregunta_id: pregunta.id, opcion_idx: opcionIdx }); }

/* ==================== PERSONAJE / AVATAR ==================== */
export async function fetchAvatarCatalogo() { return llamarAPI("avatar_catalogo_list.php"); }
export async function fetchAvatarConfig(estudianteId) { return llamarAPI(`avatar_config_get.php?estudiante_id=${estudianteId}`); }
export async function guardarAvatarConfig(estudianteId, campos) { return post("avatar_config_guardar.php", { estudiante_id: estudianteId, ...campos }); }
export async function fetchAvatarDesbloqueados(estudianteId) { return llamarAPI(`avatar_desbloqueados_list.php?estudiante_id=${estudianteId}`); }
export async function comprarParteAvatar(estudianteId, parteId, costo, monedasActuales) { return post("avatar_parte_comprar.php", { estudiante_id: estudianteId, parte_id: parteId, costo, monedas_actuales: monedasActuales }); }

/* ==================== LOGROS ==================== */
export async function fetchLogrosCatalogo() { return llamarAPI("logros_catalogo_list.php"); }
export async function fetchLogrosEstudiante(estudianteId) { return llamarAPI(`logros_estudiante_list.php?estudiante_id=${estudianteId}`); }
export async function crearLogro(campos) { return post("logro_crear.php", campos); }
export async function editarLogro(id, campos) { return post("logro_editar.php", { id, ...campos }); }
export async function eliminarLogro(id) { return post("logro_eliminar.php", { id }); }
export async function verificarYOtorgarLogros(estudianteId) { return post("verificar_y_otorgar_logros.php", { estudiante_id: estudianteId }); }
export async function fetchLogrosDuplicados() { return llamarAPI("logros_duplicados.php"); }
export async function fusionarLogrosDuplicados(idConservar, idsEliminar) { return post("logros_fusionar.php", { id_conservar: idConservar, ids_eliminar: idsEliminar }); }
export async function limpiarTodosLosDuplicadosLogros() { return post("logros_limpiar_todos_duplicados.php", {}); }

/* ==================== ÁLBUM DE CRIATURAS ==================== */
export async function fetchCriaturas() { return llamarAPI("criaturas_list.php"); }
export async function fetchCriaturasActivas() { return llamarAPI("criaturas_activas_list.php"); }
export async function crearCriatura(campos) { return post("criatura_crear.php", campos); }
export async function editarCriatura(id, campos) { return post("criatura_editar.php", { id, ...campos }); }
export async function eliminarCriatura(id) { return post("criatura_eliminar.php", { id }); }
export async function fetchAlbumConfig() { return llamarAPI("album_config_get.php"); }
export async function guardarAlbumConfig(campos) { return post("album_config_guardar.php", campos); }
export async function fetchColeccion(estudianteId) { return llamarAPI(`coleccion_list.php?estudiante_id=${estudianteId}`); }
export async function abrirSobre(estudianteId) { return post("abrir_sobre.php", { estudiante_id: estudianteId }); }
export async function fetchCriaturasDuplicadas() { return llamarAPI("criaturas_duplicadas.php"); }
export async function fusionarCriaturasDuplicadas(idConservar, idsEliminar) { return post("criaturas_fusionar.php", { id_conservar: idConservar, ids_eliminar: idsEliminar }); }
export async function limpiarTodosLosDuplicadosCriaturas() { return post("criaturas_limpiar_todos_duplicados.php", {}); }

/* ==================== GAMIFICACIÓN EXTRA ==================== */
export async function fetchCosmeticosCatalogo() { return llamarAPI("cosmeticos_catalogo_list.php"); }
export async function crearCosmetico(campos) { return post("cosmetico_crear.php", campos); }
export async function editarCosmetico(id, campos) { return post("cosmetico_editar.php", { id, ...campos }); }
export async function eliminarCosmetico(id) { return post("cosmetico_eliminar.php", { id }); }
export async function fetchCosmeticosDuplicados() { return llamarAPI("cosmeticos_duplicados.php"); }
export async function fusionarCosmeticosDuplicados(idConservar, idsEliminar) { return post("cosmeticos_fusionar.php", { id_conservar: idConservar, ids_eliminar: idsEliminar }); }
export async function limpiarTodosLosDuplicadosCosmeticos() { return post("cosmeticos_limpiar_todos_duplicados.php", {}); }
export async function fetchDesafiosReino(gradoId) { return llamarAPI(`desafios_reino_list.php?grado_id=${encodeURIComponent(gradoId)}`); }
export async function crearDesafioReino(campos) { return post("desafio_reino_crear.php", campos); }
export async function eliminarDesafioReino(id) { return post("desafio_reino_eliminar.php", { id }); }
export async function fetchProgresoDesafio(desafio) { return llamarAPI(`progreso_desafio_get.php?desafio_id=${desafio.id}`); }
export async function fetchMicroMisiones() { return llamarAPI("micro_misiones_list.php"); }
export async function crearMicroMision(campos) { return post("micro_mision_crear.php", campos); }
export async function editarMicroMision(id, campos) { return post("micro_mision_editar.php", { id, ...campos }); }
export async function eliminarMicroMision(id) { return post("micro_mision_eliminar.php", { id }); }

/* ==================== SALÓN DE HONOR / BAJAS DE VIDA / HISTORIAL ==================== */
export async function fetchSalonDeHonor() { return llamarAPI("salon_honor_get.php"); }
export async function fetchEstudiantesConBajasVida() { return llamarAPI("estudiantes_bajas_vida.php"); }
export async function fetchHistorialGamificacion(estudianteId) { return llamarAPI(`historial_gamificacion_list.php?estudiante_id=${estudianteId}`); }

/* ==================== REPORTES ==================== */
export async function fetchReporteAccesos(gradoId) { return llamarAPI(`reporte_accesos.php?grado_id=${encodeURIComponent(gradoId)}`); }
export async function fetchNotasFinalesTransversal(gradoId, periodo) { const p = periodo ? `&periodo=${periodo}` : ""; return llamarAPI(`notas_finales_transversal.php?grado_id=${encodeURIComponent(gradoId)}${p}`); }
export async function crearActaNivelacionSiReprobado(materiaId, materiaNombre, estudianteId, periodo, nota, config) { return post("acta_nivelacion_crear_si_reprobado.php", { materia_id: materiaId, materia_nombre: materiaNombre, estudiante_id: estudianteId, periodo, nota, config }); }
export async function fetchActasPorEstudiante(estudianteId) { return llamarAPI(`actas_por_estudiante.php?estudiante_id=${estudianteId}`); }

/* ==================== DIPLOMAS ==================== */
export async function fetchMiPerfil() { return llamarAPI("mi_perfil_get.php"); }
export async function guardarMiNombre(nombre) { return post("mi_nombre_guardar.php", { nombre }); }

/* ==================== INICIO (dashboard del docente) ==================== */
export async function fetchValorSemanal() { return llamarAPI("valor_semanal_get.php"); }
export async function guardarValorSemanal(campos) { return post("valor_semanal_guardar.php", campos); }
export async function fetchEntradasCodiceSinRevisar() { return llamarAPI("entradas_codice_sin_revisar.php"); }
export async function marcarCodiceRevisado(id) { return post("codice_marcar_revisado.php", { id }); }
export async function calificarEntradaCodice(entrada, estudianteId, gradoId, valor, categoriaId, periodo) {
  return post("entrada_codice_calificar.php", { entrada_id: entrada.id, estudiante_id: estudianteId, grado_id: gradoId, valor, categoria_id: categoriaId, periodo, materia_id: entrada.materia_id });
}
export async function fetchStatsDocente() { return llamarAPI("stats_docente_get.php"); }
export async function fetchResumenDocente() { return llamarAPI("resumen_docente_get.php"); }
export async function fetchClasesPendientesDeHoy(pares) { return post("clases_pendientes_de_hoy.php", { pares }); }

/* ==================== PORTAL DEL ESTUDIANTE — piezas que faltaban ==================== */
export async function buscarEstudiantesGlobal(query) { return llamarAPI(`buscar_estudiantes_global.php?q=${encodeURIComponent(query)}`); }
// OJO: es el mismo endpoint que consultarPortalEstudiante — la app real usa este nombre.
export async function fetchEstudiantePorCodigo(codigo) { return llamarAPI(`estudiante_login.php?codigo=${encodeURIComponent(codigo)}`); }
export async function registrarAcceso(estudianteId) { return post("registrar_acceso.php", { estudiante_id: estudianteId }); }
export async function fetchMiRol(estudianteId) { return llamarAPI(`mi_rol_get.php?estudiante_id=${estudianteId}`); }
export async function fetchNotasEstudiante(estudianteId) { return llamarAPI(`notas_estudiante_list.php?estudiante_id=${estudianteId}`); }
export async function fetchComentariosDesempeno() { return llamarAPI("comentarios_desempeno_list.php"); }
export async function fetchMisIntentos(evaluacionId, estudianteId) { return llamarAPI(`mis_intentos_list.php?evaluacion_id=${evaluacionId}&estudiante_id=${estudianteId}`); }
export async function fetchTareasCalificablesEstudiante(gradoId, tipo) { return llamarAPI(`tareas_calificables_estudiante.php?grado_id=${encodeURIComponent(gradoId)}&tipo=${tipo}`); }
export async function fetchMiEntrega(tareaId, estudianteId) { return llamarAPI(`mi_entrega_get.php?tarea_id=${tareaId}&estudiante_id=${estudianteId}`); }
export async function fetchTareasPlaneacionParaGrado(gradoId) { return llamarAPI(`tareas_planeacion_grado.php?grado_id=${encodeURIComponent(gradoId)}`); }
export async function fetchRankingGrado(gradoId) { return llamarAPI(`ranking_grado.php?grado_id=${encodeURIComponent(gradoId)}`); }
export async function fetchAnunciosParaGrado(gradoId) { return llamarAPI(`anuncios_grado.php?grado_id=${encodeURIComponent(gradoId)}`); }
export async function fetchBibliotecaPorNivel(nivel) { return llamarAPI(`biblioteca_nivel.php?nivel=${nivel}`); }
export async function fetchAvatarConfigsMultiples(ids) { if (!ids?.length) return []; return llamarAPI(`avatar_configs_multiples.php?estudiante_ids=${ids.join(",")}`); }
export async function fetchCosmeticosEstudiante(estudianteId) { return llamarAPI(`cosmeticos_estudiante_list.php?estudiante_id=${estudianteId}`); }
export async function fetchEquipadosEstudiante(estudianteId) { return llamarAPI(`equipados_estudiante.php?estudiante_id=${estudianteId}`); }
export async function comprarCosmetico(estudianteId, cosmetico) { return post("cosmetico_comprar.php", { estudiante_id: estudianteId, cosmetico_id: cosmetico.id }); }
export async function equiparCosmetico(estudianteId, tipo, cosmeticoId) { return post("cosmetico_equipar.php", { estudiante_id: estudianteId, tipo, cosmetico_id: cosmeticoId }); }
export async function fetchMicroMisionesEstudiante(estudianteId) { return llamarAPI(`micromisiones_estudiante.php?estudiante_id=${estudianteId}`); }
export async function completarMicroMision(mision, estudianteId) { return post("micromision_completar.php", { mision, estudiante_id: estudianteId }); }
export async function fetchAsignaturasDiploma() { return llamarAPI("asignaturas_diploma_list.php"); }
export async function crearAsignaturaDiploma(nombre, pilares) { return post("asignatura_diploma_crear.php", { nombre, pilares }); }
export async function eliminarAsignaturaDiploma(id) { return post("asignatura_diploma_eliminar.php", { id }); }

/* ==================== ANUNCIOS ==================== */
export async function fetchAnuncios() { return llamarAPI("anuncios_list.php"); }
export async function crearAnuncio(campos) { return post("anuncio_crear.php", campos); }
export async function editarAnuncio(id, campos) { return post("anuncio_editar.php", { id, ...campos }); }
export async function eliminarAnuncio(id) { return post("anuncio_eliminar.php", { id }); }

/* ==================== BIBLIOTECA ==================== */
export async function fetchBibliotecaRecursos() { return llamarAPI("biblioteca_recursos_list.php"); }
export async function crearRecursoBiblioteca(campos) { return post("recurso_biblioteca_crear.php", campos); }
export async function editarRecursoBiblioteca(id, campos) { return post("recurso_biblioteca_editar.php", { id, ...campos }); }
export async function eliminarRecursoBiblioteca(id) { return post("recurso_biblioteca_eliminar.php", { id }); }

/* ==================== HORARIO / CRONOGRAMA ==================== */
export async function fetchHorario() { return llamarAPI("horario_list.php"); }
export async function crearHorario(campos) { return post("horario_crear.php", campos); }
export async function editarHorario(id, campos) { return post("horario_editar.php", { id, ...campos }); }
export async function eliminarHorario(id) { return post("horario_eliminar.php", { id }); }
export async function fetchCronograma() { return llamarAPI("cronograma_list.php"); }
export async function crearEventoCronograma(campos) { return post("evento_cronograma_crear.php", campos); }
export async function eliminarEventoCronograma(id) { return post("evento_cronograma_eliminar.php", { id }); }

/* ==================== CORREGIR NOMBRES ==================== */
export async function fetchTodosLosEstudiantesActivos() { return llamarAPI("todos_los_estudiantes_activos.php"); }
export async function editarNombreEstudiante(id, nombre) { return post("estudiante_editar_nombre.php", { id, nombre }); }
export async function guardarApellidos(id, apellidos) { return post("estudiante_guardar_apellidos.php", { id, apellidos }); }

/* ==================== DIRECCIÓN DE CURSO ==================== */
export async function fetchOCrearMateriaDireccionCurso() { return llamarAPI("materia_direccion_curso_get_o_crear.php"); }
export async function fetchAsistenciaDetalladaCurso(gradoId, desde, hasta) { return llamarAPI(`asistencia_detallada_curso.php?grado_id=${encodeURIComponent(gradoId)}&desde=${desde}&hasta=${hasta}`); }
export async function limpiarYMigrarAsistenciaGeneral(gradoId) { return post("limpiar_y_migrar_asistencia_general.php", { grado_id: gradoId }); }
export async function moverAsistenciaGeneralAMateria(gradoId, materiaId, desde, hasta) { return post("mover_asistencia_general_a_materia.php", { grado_id: gradoId, materia_id: materiaId, desde, hasta }); }
export async function fetchTotalesAsistenciaInstitucionalCurso(gradoId, desde, hasta, materiaDCId) { return llamarAPI(`totales_asistencia_institucional_curso.php?grado_id=${encodeURIComponent(gradoId)}&desde=${desde}&hasta=${hasta}&materia_dc_id=${materiaDCId}`); }

/* ==================== ENTREGAS POR REVISAR ==================== */
export async function fetchResumenEntregasPorRevisar() { return llamarAPI("resumen_entregas_por_revisar.php"); }

/* ====================================================================
   PENDIENTE — lo poco que queda sin migrar. Si tocás algo de esto, va a
   tirar error "no es una función":
   - Anotaciones (Observador de convivencia) — no se armó ningún módulo
     para esto en toda la migración; falta desde cero.
   - Funciones secundarias de Estudiantes: cambiarReino, renombrar (el
     nombre "de un tirón", separado de Corregir Nombres), subir foto,
     generar código de acceso nuevo.
   - Calificaciones: nivelación por actividad puntual (aparte de las
     actas), comentarios de desempeño automáticos, copiar planilla
     completa entre cursos.
   - El Portal del estudiante como pantalla unificada: cada pieza ya
     tiene su función en este archivo, pero falta revisar App.jsx del
     lado del estudiante para confirmar que todas estén conectadas
     igual que del lado del docente.
   ==================================================================== */
