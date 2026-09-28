import { useState, useEffect } from 'react'

function App() {
  // 1. Catálogo de Productos
  const productos = [
    {
      id: 1,
      nombre: "Vestido Elegante de Fiesta",
      categoria: "Vestidos",
      precio: 50.99,
      imagen: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500"
    },
    {
      id: 2,
      nombre: "Zapatillas Deportivas White",
      categoria: "Calzado",
      precio: 45.00,
      imagen: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500"
    },
    {
      id: 3,
      nombre: "Chaqueta de Jean Classic",
      categoria: "Ropa Exterior",
      precio: 65.50,
      imagen: "https://images.unsplash.com/photo-1544441893-675973e31985?w=500"
    }
  ]

  // 2. ESTADOS
  const [carrito, setCarrito] = useState(() => {
    const guardado = localStorage.getItem("carrito_boutique")
    return guardado ? JSON.parse(guardado) : []
  })

  const [mostrarCarrito, setMostrarCarrito] = useState(false)
  const [busqueda, setBusqueda] = useState("")
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todas")
  const [descuento, setDescuento] = useState(0) // Estado de porcentaje de descuento aplicado

  // Estados del Chatbot
  const [mostrarchatbot, setmostrarcharbot] = useState(false)
  const [mensaje, setMensaje] = useState("")   
  const [mensajes, setMensajes] = useState([
    { 
      emisor: "bot", 
      texto: "¡Hola! 👋 Soy Bella, tu asistente de ventas. ¿En qué te puedo asesorar hoy?",
      opciones: ["🚚 Envíos y Entregas", "👗 Recomiéndame algo", "🎟️ Tengo un cupón", "💳 Métodos de Pago"]
    }
  ])

  // 3. EFECTO SECUNDARIO: LocalStorage
  useEffect(() => {
    localStorage.setItem("carrito_boutique", JSON.stringify(carrito))
  }, [carrito])

  // 4. LÓGICA DE FILTRADO
  const productosFiltrados = productos.filter((producto) => {
    const coincideNombre = producto.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCategoria = categoriaSeleccionada === "Todas" || producto.categoria === categoriaSeleccionada
    return coincideNombre && coincideCategoria
  })

  // Funciones del Carrito
  const agregarAlCarrito = (producto) => setCarrito((prev) => [...prev, producto])
  const eliminarDelCarrito = (indexAEliminar) => setCarrito(carrito.filter((_, index) => index !== indexAEliminar))
  const vaciarCarrito = () => {
    setCarrito([])
    setDescuento(0)
  }
  
  const subtotal = carrito.reduce((suma, item) => suma + item.precio, 0)
  const totalPrecio = subtotal - (subtotal * (descuento / 100))

  // Enviar Pedido a WhatsApp con descuento reflejado
  const enviarAWhatsApp = () => {
    const telefonoTienda = "584241251299"
    let mensajeWS = "Hola, me gustaría realizar el siguiente pedido:%0A%0A"
    carrito.forEach((item) => {
      mensajeWS += `• ${item.nombre} - $${item.precio.toFixed(2)}%0A`
    })
    if (descuento > 0) {
      mensajeWS += `%0A*Subtotal: $${subtotal.toFixed(2)}*`
      mensajeWS += `%0A*Descuento Aplicado (${descuento}%): -$${(subtotal * (descuento / 100)).toFixed(2)}*`
    }
    mensajeWS += `%0A*Total a pagar: $${totalPrecio.toFixed(2)}*`
    window.open(`https://wa.me/${telefonoTienda}?text=${mensajeWS}`, '_blank')
  }

  // Motor Inteligente del Chatbot
  const procesarRespuestaBot = (textoInput) => {
    const textoLower = textoInput.toLowerCase()
    let respuestaBot = { emisor: "bot", texto: "", productoSugerido: null, opciones: [] }

    if (textoLower.includes("envío") || textoLower.includes("envio") || textoLower.includes("entrega")) {
      respuestaBot.texto = "🚚 Realizamos envíos nacionales expresos (2 a 4 días). ¡En compras mayores a $100 el envío es completamente GRATIS!"
      respuestaBot.opciones = ["👗 Recomiéndame algo", "💳 Métodos de Pago"]
    } else if (textoLower.includes("recomiéntame") || textoLower.includes("recomiendame") || textoLower.includes("recomendacion") || textoLower.includes("vestido")) {
      const sugerencia = productos[0] // Sugiere el Vestido Elegante
      respuestaBot.texto = `✨ Te recomiendo nuestro **${sugerencia.nombre}**. Es el favorito de la temporada por $${sugerencia.precio}.`
      respuestaBot.productoSugerido = sugerencia
      respuestaBot.opciones = ["🎟️ Tengo un cupón", "💳 Métodos de Pago"]
    } else if (textoLower.includes("cupón") || textoLower.includes("cupon") || textoLower.includes("descuento")) {
      respuestaBot.texto = "🎉 Usa el cupón 'DESCUENTO10' para obtener un 10% OFF en tu compra total. ¡Escribe el código aquí para activarlo!"
    } else if (textoLower.includes("descuento10")) {
      if (descuento > 0) {
        respuestaBot.texto = "⚠️ Ya tienes aplicado un cupón de 10% de descuento en tu carrito."
      } else {
        setDescuento(10)
        respuestaBot.texto = "✅ ¡Genial! He aplicado un 10% de descuento al total de tu carrito."
      }
    } else if (textoLower.includes("pago") || textoLower.includes("precio") || textoLower.includes("métodos")) {
      respuestaBot.texto = "💳 Aceptamos Pago Móvil, Zelle, Transferencias en BS y Checkout directo por WhatsApp."
    } else if (textoLower.includes("total") || textoLower.includes("cuanto") || textoLower.includes("cuánto")) {
      respuestaBot.texto = `🛒 Tu total actual acumulado es: $${totalPrecio.toFixed(2)} (${carrito.length} productos).`
    } else {
      respuestaBot.texto = "Lo siento, no entendí tu consulta. ¿Buscas ayuda con envíos, recomendaciones o cupones de descuento?"
      respuestaBot.opciones = ["🚚 Envíos y Entregas", "👗 Recomiéndame algo", "🎟️ Tengo un cupón"]
    }

    setMensajes((prev) => [...prev, respuestaBot])
  }

  // Enviar Mensaje desde el Input o por Click
  const enviarMensaje = (e, textoDirecto = null) => {
    if (e) e.preventDefault()

    const textoAEnviar = textoDirecto || mensaje
    if (!textoAEnviar.trim()) return

    setMensajes((prev) => [...prev, { emisor: "usuario", texto: textoAEnviar }])
    if (!textoDirecto) setMensaje("")

    setTimeout(() => {
      procesarRespuestaBot(textoAEnviar)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 shadow-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
            🛍️ Boutique Bella
          </h1>
          <button 
            onClick={() => setMostrarCarrito(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold transition cursor-pointer flex items-center gap-2"
          >
            🛒 Carrito ({carrito.length})
          </button>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-6xl mx-auto p-6">
        
        {/* Filtros: Buscador + Categorías */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
          <input 
            type="text"
            placeholder="🔍 Buscar prenda..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full md:w-80 p-3 rounded-xl border border-slate-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {["Todas", "Vestidos", "Calzado", "Ropa Exterior"].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaSeleccionada(cat)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition cursor-pointer ${
                  categoriaSeleccionada === cat 
                    ? "bg-emerald-500 text-white" 
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Muestra de Tarjetas de Productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {productosFiltrados.length === 0 ? (
            <p className="col-span-full text-center text-slate-400 py-10">
              No se encontraron productos que coincidan con la búsqueda.
            </p>
          ) : (
            productosFiltrados.map((producto) => (
              <div key={producto.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <img src={producto.imagen} alt={producto.nombre} className="w-full h-52 object-cover" />
                  <div className="p-4">
                    <span className="text-xs font-bold text-emerald-600 uppercase">{producto.categoria}</span>
                    <h3 className="text-lg font-bold text-slate-800 mt-1">{producto.nombre}</h3>
                  </div>
                </div>
                <div className="p-4 pt-0 flex justify-between items-center">
                  <span className="text-xl font-bold">${producto.precio.toFixed(2)}</span>
                  <button 
                    onClick={() => agregarAlCarrito(producto)}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
          
      </main>

      {/* Drawer Lateral del Carrito */}
      {mostrarCarrito && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full p-6 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex justify-between items-center border-b pb-4 mb-4">
                <h3 className="text-xl font-bold">Tu Pedido</h3>
                <button onClick={() => setMostrarCarrito(false)} className="text-slate-400 text-xl font-bold cursor-pointer">✕</button>
              </div>

              {carrito.length === 0 ? (
                <p className="text-slate-400 text-center py-8">Tu carrito está vacío</p>
              ) : (
                <>
                  <div className="flex justify-end mb-2">
                    <button onClick={vaciarCarrito} className="text-xs text-red-500 underline cursor-pointer">
                      Vaciar carrito
                    </button>
                  </div>
                  <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                    {carrito.map((item, index) => (
                      <div key={index} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border">
                        <div>
                          <p className="font-semibold text-sm">{item.nombre}</p>
                          <p className="text-emerald-600 font-bold text-sm">${item.precio.toFixed(2)}</p>
                        </div>
                        <button onClick={() => eliminarDelCarrito(index)} className="text-red-500 text-xs font-bold cursor-pointer">Quitar</button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="border-t pt-4">
              {descuento > 0 && (
                <div className="flex justify-between items-center text-sm text-emerald-600 font-semibold mb-1">
                  <span>Descuento ({descuento}%):</span>
                  <span>-${(subtotal * (descuento / 100)).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-slate-600">Total:</span>
                <span className="text-2xl font-black text-slate-900">${totalPrecio.toFixed(2)}</span>
              </div>
              <button 
                onClick={enviarAWhatsApp}
                disabled={carrito.length === 0}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl transition cursor-pointer shadow-md"
              >
                📲 Enviar Pedido por WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHATBOT INTELIGENTE FLOTANTE */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
        {mostrarchatbot && (
          <div className="bg-white w-80 sm:w-96 h-[450px] rounded-2xl shadow-2xl border border-slate-200 mb-3 p-4 flex flex-col justify-between">
            
            {/* Encabezado del Chat */}
            <div className="border-b pb-2 flex justify-between items-center bg-slate-50 -mx-4 -mt-4 p-4 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                <h3 className="font-bold text-slate-800 text-sm">🤖 Asistente Bella (Ventas)</h3>
              </div>
              <button 
                onClick={() => setmostrarcharbot(false)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Historial de Mensajes Dinámico */}
            <div className="flex-1 my-2 overflow-y-auto text-sm text-slate-600 flex flex-col gap-3 p-1">
              {mensajes.map((msg, index) => (
                <div 
                  key={index} 
                  className={`flex flex-col ${msg.emisor === "usuario" ? "items-end" : "items-start"}`}
                >
                  <p className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                    msg.emisor === "usuario" 
                      ? "bg-emerald-500 text-white rounded-br-none shadow-sm" 
                      : "bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200"
                  }`}>
                    {msg.texto}
                  </p>

                  {/* Tarjeta interactiva dentro del chat si el bot sugiere un producto */}
                  {msg.productoSugerido && (
                    <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-2 max-w-[85%]">
                      <div className="text-xs">
                        <p className="font-bold text-slate-800">{msg.productoSugerido.nombre}</p>
                        <p className="text-emerald-700 font-semibold">${msg.productoSugerido.precio}</p>
                      </div>
                      <button
                        onClick={() => agregarAlCarrito(msg.productoSugerido)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2 py-1.5 rounded-lg font-bold transition cursor-pointer"
                      >
                        + Agregar
                      </button>
                    </div>
                  )}

                  {/* Opciones rápidas (Botones clickeables) */}
                  {msg.opciones && msg.opciones.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                      {msg.opciones.map((opcion, i) => (
                        <button
                          key={i}
                          onClick={() => enviarMensaje(null, opcion)}
                          className="text-xs bg-white border border-emerald-500 text-emerald-700 hover:bg-emerald-50 px-2.5 py-1 rounded-full font-medium transition cursor-pointer"
                        >
                          {opcion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Formulario e Input */}
            <form className="w-full flex gap-2 pt-2 border-t border-slate-200" onSubmit={(e) => enviarMensaje(e)}>
              <input 
                type="text"
                placeholder="Escribe 'cupón', 'envío'..."
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                className="flex-1 p-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button 
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm font-semibold transition cursor-pointer"
              >
                Enviar
              </button>
            </form>

          </div>
        )}

        {/* Botón Flotante con indicador de atención */}
        <button 
          onClick={() => setmostrarcharbot(!mostrarchatbot)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-full font-semibold transition cursor-pointer shadow-xl flex items-center gap-2 hover:scale-105"
        >
          🤖 <span className="hidden sm:inline">Asistente Virtual</span>
        </button>
      </div>

    </div>
  )
}

export default App