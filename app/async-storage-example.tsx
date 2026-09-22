// Pantalla de ejemplo: uso básico de AsyncStorage
// AsyncStorage es un almacenamiento tipo clave-valor, asíncrono y persistente
// (los datos se guardan en el dispositivo aunque se cierre la app).
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';

// Clave fija que usaremos para guardar/leer/eliminar el dato en AsyncStorage
const CLAVE_NOTA = 'nota_usuario';

export default function AsyncStorageExample() {
  // Texto que el usuario está escribiendo en el TextInput
  const [texto, setTexto] = useState('');
  // Valor que se muestra en pantalla luego de leer AsyncStorage
  const [valorGuardado, setValorGuardado] = useState<string | null>(null);
  // Mensaje de feedback (éxito o error) para el usuario
  const [mensaje, setMensaje] = useState('');

  // Guarda el texto actual en AsyncStorage bajo la clave "nota_usuario"
  const guardar = async () => {
    try {
      await AsyncStorage.setItem(CLAVE_NOTA, texto);
      setMensaje('Guardado correctamente ✔');
    } catch (error) {
      // Si algo falla (por ejemplo, error de almacenamiento), lo mostramos
      console.error(error);
      setMensaje('Error al guardar');
    }
  };

  // Actualiza el valor guardado en AsyncStorage, pero solo si ya existe.
  // A diferencia de "guardar" (que crea o sobrescribe sin condiciones),
  // "actualizar" primero verifica con getItem que haya un valor previo,
  // de forma similar a como en SQLite un UPDATE ... WHERE id = ? solo tiene
  // sentido sobre una fila que ya existe en la tabla.
  const actualizar = async () => {
    try {
      const valorExistente = await AsyncStorage.getItem(CLAVE_NOTA);
      if (valorExistente === null) {
        // No hay nada que actualizar todavía: no sobrescribimos con setItem
        setMensaje('No existe un valor guardado para actualizar. Usa "Guardar" primero.');
        return;
      }
      // Ya existe un valor previo, así que lo sobrescribimos con el texto actual
      await AsyncStorage.setItem(CLAVE_NOTA, texto);
      setMensaje('Actualizado correctamente ✔');
    } catch (error) {
      console.error(error);
      setMensaje('Error al actualizar');
    }
  };

  // Lee el valor guardado en AsyncStorage y lo muestra en pantalla
  const leer = async () => {
    try {
      const valor = await AsyncStorage.getItem(CLAVE_NOTA);
      // Si no existe nada guardado, getItem devuelve null
      setValorGuardado(valor);
      setMensaje(valor !== null ? 'Lectura exitosa ✔' : 'No hay ningún valor guardado');
    } catch (error) {
      console.error(error);
      setMensaje('Error al leer');
    }
  };

  // Elimina la clave "nota_usuario" de AsyncStorage
  const eliminar = async () => {
    try {
      await AsyncStorage.removeItem(CLAVE_NOTA);
      setValorGuardado(null);
      setMensaje('Eliminado correctamente ✔');
    } catch (error) {
      console.error(error);
      setMensaje('Error al eliminar');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Ejemplo AsyncStorage</Text>

      {/* Campo de texto donde el usuario escribe la nota */}
      <TextInput
        style={styles.input}
        placeholder="Escribe un texto para guardar"
        value={texto}
        onChangeText={setTexto}
      />

      {/* Botones de las 4 acciones principales, en dos filas de dos */}
      <View style={styles.botonesFila}>
        <View style={styles.boton}>
          <Button title="Guardar" onPress={guardar} />
        </View>
        <View style={styles.boton}>
          <Button title="Leer" onPress={leer} />
        </View>
      </View>
      <View style={styles.botonesFila}>
        <View style={styles.boton}>
          <Button title="Actualizar" onPress={actualizar} />
        </View>
        <View style={styles.boton}>
          <Button title="Eliminar" onPress={eliminar} color="#FFB3BA" />
        </View>
      </View>

      {/* Feedback visual simple de la última acción realizada */}
      {mensaje !== '' && <Text style={styles.mensaje}>{mensaje}</Text>}

      {/* Muestra el valor leído desde AsyncStorage */}
      <Text style={styles.subtitulo}>Valor guardado actualmente:</Text>
      <Text style={styles.valor}>{valorGuardado ?? '(nada leído aún)'}</Text>
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
    marginBottom: 12,
  },
  botonesFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  boton: {
    flex: 1,
    marginHorizontal: 4,
  },
  mensaje: {
    marginBottom: 12,
    fontStyle: 'italic',
  },
  subtitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  valor: {
    fontSize: 16,
    marginTop: 4,
  },
});
