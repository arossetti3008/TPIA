// Contenido de apoyo por concepto, mostrado en la pantalla de Nodo Activo
// (seccion "Terminos clave" e "Imagen de referencia" del wireframe B).
// Es contenido educativo generico redactado para este proyecto, no proviene
// de ninguna fuente con derechos de autor.
export const CONTENIDO_POR_SLUG = {
  contraste: {
    caption: 'Dos formas de igual tamaño, una en tono oscuro y otra en tono claro sobre el mismo fondo.',
    etiquetaVisual: 'Tono claro / tono oscuro',
    terminos: [
      { termino: 'Contraste tonal', definicion: 'Diferencia de luminosidad entre dos elementos.' },
      { termino: 'Contraste de forma', definicion: 'Oposición entre figuras geométricas y orgánicas.' },
      { termino: 'Peso visual', definicion: 'Cuánto atrae la atención un elemento frente a otro.' },
    ],
  },
  ritmo: {
    caption: 'Una fila de líneas verticales que se repiten con el mismo espacio entre ellas.',
    etiquetaVisual: 'Repetición · intervalo regular',
    terminos: [
      { termino: 'Módulo', definicion: 'El elemento que se repite.' },
      { termino: 'Intervalo', definicion: 'Espacio entre módulos.' },
      { termino: 'Variación', definicion: 'Añade dinamismo al ritmo.' },
    ],
  },
  jerarquia: {
    caption: 'Tres círculos de distinto tamaño, ordenados del más grande al más chico.',
    etiquetaVisual: 'Tamaño decreciente · orden de lectura',
    terminos: [
      { termino: 'Punto focal', definicion: 'El elemento que primero capta la atención.' },
      { termino: 'Escala', definicion: 'Diferencia de tamaño entre elementos relacionados.' },
      { termino: 'Orden de lectura', definicion: 'La secuencia en la que el ojo recorre la composición.' },
    ],
  },
  gestalt: {
    caption: 'Varios puntos agrupados de a pares, separados de otros grupos de puntos.',
    etiquetaVisual: 'Proximidad · agrupamiento',
    terminos: [
      { termino: 'Proximidad', definicion: 'Elementos cercanos se perciben como un grupo.' },
      { termino: 'Similitud', definicion: 'Elementos parecidos se agrupan visualmente.' },
      { termino: 'Cierre', definicion: 'La mente completa formas incompletas.' },
    ],
  },
  tension: {
    caption: 'Una forma inclinada apoyada sobre un solo vértice, a punto de caer.',
    etiquetaVisual: 'Desequilibrio · direccionalidad',
    terminos: [
      { termino: 'Equilibrio inestable', definicion: 'Composición que sugiere movimiento inminente.' },
      { termino: 'Direccionalidad', definicion: 'Hacia dónde parece "querer" moverse la forma.' },
      { termino: 'Punto de apoyo', definicion: 'El lugar donde la composición se sostiene visualmente.' },
    ],
  },
};

export function obtenerContenido(slug) {
  return (
    CONTENIDO_POR_SLUG[slug] || {
      caption: 'Ejemplo visual de este concepto.',
      etiquetaVisual: '',
      terminos: [],
    }
  );
}
