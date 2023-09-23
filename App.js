import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Alert } from "react-native";
import { Fontisto } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { theme } from "./colors";

const TODOS_KEY = "@toDos";
const WORKING_KEY = "@working";
const MODE_KEY = "@mode";

export default function App() {
  const [mode, setMode] = useState("light");
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const travel = () => {
    setWorking(false);
    saveWorking(false);
  };
  const work = () => {
    setWorking(true);
    saveWorking(true);
  };
  const onChangeText = (payload) => setText(payload);
  const saveToDos = async (toSave) => {
    try {
      await AsyncStorage.setItem(TODOS_KEY, JSON.stringify(toSave));
    } catch (error) {
      console.log(error);
    }
  };
  const loadToDos = async () => {
    try {
      const value = await AsyncStorage.getItem(TODOS_KEY);
      if (value) {
        setToDos(JSON.parse(value));
      }
    } catch (error) {
      console.log(error);
    }
  };
  const addToDo = async () => {
    if (text === "") return;

    const newToDos = Object.assign({}, toDos, {
      [Date.now()]: { text, work: working, completed: false, editMode: false, editText: text },
    });
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };
  const deleteToDo = (key) => {
    Alert.alert("Delete To Do", "Are you sure?", [
      {
        text: "Cancel",
        onPress: () => console.log("Cancel Pressed"),
        style: "cancel",
      },
      {
        text: "Sure",
        onPress: () => {
          const newToDos = { ...toDos };
          delete newToDos[key];
          setToDos(newToDos);
          saveToDos(newToDos);
        },
        style: "destructive",
      },
    ]);
  };
  const saveWorking = async (work) => {
    try {
      await AsyncStorage.setItem(WORKING_KEY, JSON.stringify(work));
    } catch (error) {
      console.log(error);
    }
  };
  const loadWorking = async () => {
    try {
      const value = await AsyncStorage.getItem(WORKING_KEY);
      if (value !== null) {
        setWorking(JSON.parse(value));
      }
    } catch (error) {
      console.log(error);
    }
  };
  const checkCompleted = (key) => {
    const newToDos = { ...toDos, [key]: { ...toDos[key], completed: !toDos[key].completed } };
    setToDos(newToDos);
    saveToDos(newToDos);
  };
  const changeEditMode = (key) => {
    const newToDos = { ...toDos, [key]: { ...toDos[key], editMode: true } };
    setToDos(newToDos);
    saveToDos(newToDos);
  };
  const onChangeEditText = (e, key) => {
    const newToDos = { ...toDos, [key]: { ...toDos[key], editText: e } };
    setToDos(newToDos);
  };
  const editToDo = (key) => {
    if (toDos[key].editText === "") {
      return;
    }

    const newToDos = { ...toDos, [key]: { ...toDos[key], editMode: false, text: toDos[key].editText } };
    setToDos(newToDos);
    saveToDos(newToDos);
  };
  const cancelEdit = (key) => {
    const newToDos = { ...toDos, [key]: { ...toDos[key], editMode: false, editText: toDos[key].text } };
    setToDos(newToDos);
  };
  const saveMode = async (mode) => {
    try {
      await AsyncStorage.setItem(MODE_KEY, JSON.stringify(mode));
    } catch (error) {
      console.log(error);
    }
  };
  const loadMode = async () => {
    try {
      const value = await AsyncStorage.getItem(MODE_KEY);
      if (value !== null) {
        setMode(JSON.parse(value));
      }
    } catch (error) {
      console.log(error);
    }
  };
  const changeMode = () => {
    const newMode = mode === "dark" ? "light" : "dark";
    setMode(newMode);
    saveMode(newMode);
  };

  useEffect(() => {
    loadMode();
    loadWorking();
    loadToDos();
  }, []);

  return (
    <View style={{ ...styles.container, backgroundColor: theme[mode].bg }}>
      <View style={styles.mode}>
        <TouchableOpacity onPress={changeMode}>
          {mode === "dark" ? (
            <Feather name="moon" size={32} color={theme[mode].font} />
          ) : (
            <Feather name="sun" size={32} color={theme[mode].font} />
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text style={{ ...styles.btnText, color: working ? theme[mode].pink : theme[mode].grey }}>Work</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text style={{ ...styles.btnText, color: !working ? theme[mode].pink : theme[mode].grey }}>Travel</Text>
        </TouchableOpacity>
      </View>
      <View>
        <TextInput
          value={text}
          onChangeText={onChangeText}
          onSubmitEditing={addToDo}
          returnKeyType="done"
          placeholder={working ? "What do you have to do?" : "Where do you want to go?"}
          style={{ ...styles.input, backgroundColor: theme[mode].inputBg }}
        />
      </View>
      <ScrollView>
        {Object.keys(toDos)
          .reverse()
          .map((key) => {
            return toDos[key].work === working ? (
              <View key={key} style={{ ...styles.toDo, backgroundColor: theme[mode].grey }}>
                {toDos[key].editMode ? (
                  <>
                    <View style={{ minWidth: "75%" }}>
                      <TextInput
                        value={toDos[key].editText}
                        onChangeText={(e) => onChangeEditText(e, key)}
                        onSubmitEditing={() => editToDo(key)}
                        returnKeyType="done"
                        placeholder={working ? "What do you have to do?" : "Where do you want to go?"}
                        style={{ ...styles.editInput, color: theme[mode].font }}
                      />
                    </View>
                    <TouchableOpacity onPress={() => cancelEdit(key)}>
                      <Fontisto name="close-a" size={16} color={theme[mode].lightgrey} />
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <View style={styles.toDoLeft}>
                      <TouchableOpacity onPress={() => checkCompleted(key)}>
                        <Fontisto
                          name="check"
                          size={18}
                          color={toDos[key].completed ? theme[mode].pink : theme[mode].lightgrey}
                        />
                      </TouchableOpacity>
                      <Text
                        style={{
                          ...styles.toDoText,
                          color: toDos[key].completed ? theme[mode].lightgrey : theme[mode].font,
                          textDecorationLine: toDos[key].completed ? "line-through" : "none",
                        }}
                      >
                        {toDos[key].text}
                      </Text>
                    </View>
                    <View style={styles.toDoRight}>
                      {!toDos[key].completed && (
                        <TouchableOpacity onPress={() => changeEditMode(key)}>
                          <Feather name="edit" size={20} color={theme[mode].lightgrey} />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity onPress={() => deleteToDo(key)}>
                        <Feather name="trash-2" size={20} color={theme[mode].lightgrey} />
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            ) : null;
          })}
      </ScrollView>
      <StatusBar style={mode === "light" ? "dark" : "light"} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  mode: {
    marginTop: 40,
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    marginTop: 40,
    justifyContent: "space-evenly",
  },
  btnText: {
    fontSize: 32,
    fontWeight: "600",
  },
  input: {
    marginVertical: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 40,
    backgroundColor: "white",
    fontSize: 16,
  },
  toDo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  toDoText: {
    fontSize: 18,
  },
  toDoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  toDoRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editInput: {
    fontSize: 18,
  },
});
