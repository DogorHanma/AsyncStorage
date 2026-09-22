// Pantalla de ejemplo: uso básico de SQLite (base de datos local con tablas y SQL)
// A diferencia de AsyncStorage (clave-valor), SQLite permite guardar datos
// estructurados en tablas y consultarlos con sentencias SQL.
import { useCallback, useEffect, useState } from 'react';
import { Button, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import * as SQLite from 'expo-sqlite';

// Forma que tiene cada fila de la tabla "tareas"
type Tarea = {
  id: number;
  titulo: string;
  completada: number; // 0 = pendiente, 1 = completada (SQLite no tiene tipo booleano)
};

export default function SQLiteExample() {
  // Guardamos la conexión a la base de datos en el estado (en vez de abrirla de forma
  // síncrona con openDatabaseSync). En la versión web, openDatabaseSync se comunica con
  // un Web Worker de forma bloqueante y eso puede fallar con "Sync operation timeout" si
  // el navegador no logra el aislamiento de origen cruzado que ese modo requiere.
  // openDatabaseAsync evita ese problema y funciona igual en web, Android e iOS.
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);

  // Texto del TextInput para el título de la nueva tarea
  const [titulo, setTitulo] = useState('');
  // Lista de tareas leídas desde la base de datos, para mostrar en el FlatList
  const [tareas, setTareas] = useState<Tarea[]>([]);
  // Mensaje simple de feedback para el usuario
  const [mensaje, setMensaje] = useState('');

  // Lee todas las tareas de la tabla y actualiza el estado (refresca la lista en pantalla)
  const cargarTareas = useCallback(async (database: SQLite.SQLiteDatabase) => {
    try {
      const filas = await database.getAllAsync<Tarea>('SELECT * FROM tareas ORDER BY id DESC');
      setTareas(filas);
    } catch (error) {
      console.error(error);
      setMensaje('Error al leer las tareas');
    }
  }, []);

  // Al montar la pantalla: abrimos (o creamos) "miapp.db", creamos la tabla "tareas"
  // si no existe y luego cargamos los datos.
  useEffect(() => {
    // Bandera para no actualizar el estado si la pantalla ya se desmontó
    let activo = true;

    const inicializar = async () => {
      try {
        const database = await SQLite.openDatabaseAsync('miapp.db');
        await database.execAsync(
          `CREATE TABLE IF NOT EXISTS tareas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            completada INTEGER NOT NULL DEFAULT 0
          );`
        );
        if (!activo) return;
        setDb(database);
        await cargarTareas(database);
      } catch (error) {
        console.error(error);
        setMensaje('Error al crear la base de datos');
      }
    };
    inicializar();

    return () => {
      activo = false;
    };
  }, [cargarTareas]);

  // Inserta una nueva tarea con el título escrito en el TextInput
  const agregarTarea = async () => {
    if (!db) return; // la base de datos todavía no terminó de abrirse
    // Evitamos insertar tareas vacías
    if (titulo.trim() === '') {
      setMensaje('Escribe un título antes de agregar');
      return;
    }
    try {
      await db.runAsync('INSERT INTO tareas (titulo, completada) VALUES (?, 0)', titulo);
      setTitulo('');
      setMensaje('Tarea agregada ✔');
      await cargarTareas(db); // refrescamos la lista después de agregar
    } catch (error) {
      console.error(error);
      setMensaje('Error al agregar la tarea');
    }
  };

  // Cambia el estado completada/pendiente de una tarea (UPDATE)
  const alternarCompletada = async (tarea: Tarea) => {
    if (!db) return;
    try {
      const nuevoValor = tarea.completada === 0 ? 1 : 0;
      await db.runAsync('UPDATE tareas SET completada = ? WHERE id = ?', nuevoValor, tarea.id);
      await cargarTareas(db); // refrescamos la lista después de actualizar
    } catch (error) {
      console.error(error);
      setMensaje('Error al actualizar la tarea');
    }
  };

  // Elimina una tarea de la base de datos (DELETE)
  const eliminarTarea = async (id: number) => {
    if (!db) return;
    try {
      await db.runAsync('DELETE FROM tareas WHERE id = ?', id);
      await cargarTareas(db); // refrescamos la lista después de eliminar
    } catch (error) {
      console.error(error);
      setMensaje('Error al eliminar la tarea');
    }
  };

  // Mientras la base de datos todavía se está abriendo, mostramos un texto simple
  if (!db) {
    return (
      <View style={styles.container}>
        <Text style={styles.titulo}>Ejemplo SQLite</Text>
        <Text>Cargando base de datos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Ejemplo SQLite</Text>

      {/* Campo de texto y botón para agregar una tarea nueva */}
      <TextInput
        style={styles.input}
        placeholder="Título de la tarea"
        value={titulo}
        onChangeText={setTitulo}
      />
      <Button title="Agregar" onPress={agregarTarea} />

      {mensaje !== '' && <Text style={styles.mensaje}>{mensaje}</Text>}

      {/* Lista de tareas leídas desde la tabla "tareas" */}
      <FlatList
        style={styles.lista}
        data={tareas}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<Text>No hay tareas guardadas todavía.</Text>}
        renderItem={({ item }) => (
          <View style={styles.fila}>
            <Text
              style={[
                styles.textoTarea,
                item.completada === 1 && styles.textoCompletado,
              ]}>
              {item.titulo}
            </Text>
            <View style={styles.botonesFila}>
              <View style={styles.boton}>
                <Button
                  title={item.completada === 1 ? 'Pendiente' : 'Completar'}
                  onPress={() => alternarCompletada(item)}
                />
              </View>
              <View style={styles.boton}>
                <Button title="Eliminar" color="#FFB3BA" onPress={() => eliminarTarea(item.id)} />
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0D4E8',
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  mensaje: {
    marginVertical: 8,
    fontStyle: 'italic',
  },
  lista: {
    marginTop: 12,
  },
  fila: {
    borderBottomWidth: 1,
    borderBottomColor: '#F5EEF8',
    paddingVertical: 8,
  },
  textoTarea: {
    fontSize: 16,
    marginBottom: 4,
  },
  textoCompletado: {
    textDecorationLine: 'line-through',
    color: '#B8A9C9',
  },
  botonesFila: {
    flexDirection: 'row',
  },
  boton: {
    marginRight: 8,
  },
});
