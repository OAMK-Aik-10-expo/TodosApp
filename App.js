import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const savedTasks = await AsyncStorage.getItem('tasks');
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const saveTasks = async (tasks) => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error(error);
    }
  };

  const addTask = useCallback(() => {
    if (newTask.trim()) {
      const updatedTasks = [...tasks, { text: newTask, done: false }];
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
      setNewTask('');
    }
  }, [newTask, tasks]);

  const toggleTask = useCallback((index) => {
    const updatedTasks = tasks.map((task, i) => {
      if (i === index) {
        return { ...task, done: !task.done };
      }
      return task;
    });
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  }, [tasks]);

  const renderItem = useCallback(({ item, index }) => (
    <TouchableOpacity onPress={() => toggleTask(index)}>
      <Text style={[styles.task, item.done && styles.done]}>{item.text}</Text>
    </TouchableOpacity>
  ), [toggleTask]);

  const memoizedTasks = useMemo(() => tasks, [tasks]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Todo List</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newTask}
          onChangeText={setNewTask}
          placeholder="Add new task"
        />
        <Button title="Add" onPress={addTask} />
      </View>
      <FlatList
        data={memoizedTasks}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60, // Add padding to avoid camera overlap
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginRight: 10,
    padding: 10,
  },
  task: {
    fontSize: 18,
    padding: 10,
  },
  done: {
    textDecorationLine: 'line-through',
    color: 'gray',
  },
});
