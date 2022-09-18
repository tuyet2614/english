import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import styles from '../component/Style';
import axios from 'axios';
import vocabService from '../service/VocabService';
import {Header} from 'native-base';

const Item = ({item, onPress, showEdit}) =>
  item.id === '50' ? (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.folder, {backgroundColor: '#55a15e'}]}>
      <Text
        style={{
          fontSize: 22,
          fontWeight: 'bold',
          alignSelf: 'center',
          color: '#fff',
        }}>
        {item.title}
      </Text>
    </TouchableOpacity>
  ) : (
    <View>
      <TouchableOpacity onPress={onPress} style={styles.folder}>
        <Text
          style={{
            fontSize: 20,
            // fontWeight: 'bold',
            alignSelf: 'center',
            color: '#000',
          }}>
          {item.title}
        </Text>
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
          }}
          onPress={showEdit}>
          <Image
            source={require('../component/images/pen.png')}
            style={styles.icon_addFolder}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );

const MyWord = ({navigation}) => {
  const [listFolder, setListFolder] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [titleFolder, setTitleFolder] = useState('');
  const [isShowEdit, setIsShowEdit] = useState(false);
  const [currentId, setCurrentId] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const renderItem = ({item}) => {
    return (
      <Item
        item={item}
        onPress={() => {
          navigation.navigate('MyVocabulary', {titleGroup: item});
        }}
        showEdit={() => {
          setIsShowEdit(true),
            setTitleFolder(item.title),
            setCurrentId(item.id);
        }}
      />
    );
  };

  const renderFolder = () => {
    let exam = [];
    setLoading(true);
    vocabService
      .getAll()
      .then(res => {
        res.data.map(item => (!item.handle ? '' : exam.push(item)));

        setListFolder(exam);
        setLoading(false);
      })
      .catch(error => {
        setLoading(false);
        console.log(error);
      });
  };

  const onSubmitFormHandler = async () => {
    let data = {
      title: titleFolder,
      handle: true,
      score: 0,
    };
    setLoading(true);
    vocabService
      .create(data)
      .then(res => {
        setListFolder(pre => [...pre, res.data]);
        console.log('success fully');
        setLoading(false);
      })
      .catch(error => {
        console.log(error);
        setLoading(false);
      });
  };

  const handleEditFolder = () => {
    let data = {
      title: editTitle,
    };
    setLoading(true);
    vocabService
      .update(currentId, data)
      .then(res => {
        setListFolder(
          listFolder.map(item =>
            item.id === currentId ? {...res.data, title: editTitle} : item,
          ),
        );
        setLoading(false);
      })
      .catch(error => {
        console.log(error);
        setLoading(false);
      });
  };

  const handleDelete = () => {
    setLoading(true);
    vocabService
      .remove(currentId)
      .then(res => {
        const newFolderList = listFolder.filter(item => item.id !== currentId);
        setListFolder(newFolderList);
        setLoading(false);
      })
      .catch(error => {
        console.log(error);
        setLoading(false);
      });
  };

  useEffect(() => {
    renderFolder();
  }, []);

  return (
    <View style={styles.myWord}>
      <View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
            setModalVisible(!modalVisible);
          }}>
          <View
            style={[
              styles.centeredView,
              {backgroundColor: 'rgba(64,64,64, 0.8)'},
            ]}>
            <View style={styles.modalView}>
              <Text style={styles.textStyle}>Add new folder</Text>
              <TextInput
                style={styles.inputAdd}
                placeholder="Enter folder name"
                onChangeText={text => {
                  setTitleFolder(text);
                }}
              />
              <View style={styles.choosen}>
                <TouchableOpacity
                  onPress={() => setModalVisible(!modalVisible)}>
                  <Text style={styles.textStyle}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(!modalVisible), onSubmitFormHandler();
                  }}>
                  <Text style={styles.textStyle}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          animationType="slide"
          transparent={true}
          visible={isShowEdit}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
            setIsShowEdit(!isShowEdit);
          }}>
          <View
            style={[
              styles.centeredView,
              {backgroundColor: 'rgba(64,64,64, 0.8)'},
            ]}>
            <View style={styles.modalView}>
              <Text style={styles.textStyle}>Edit folder</Text>
              <TextInput
                style={styles.inputAdd}
                defaultValue={titleFolder}
                onChangeText={text => {
                  setEditTitle(text);
                }}
              />
              <View style={styles.choosen}>
                <TouchableOpacity
                  onPress={() => {
                    setIsShowEdit(!isShowEdit), handleDelete();
                  }}>
                  <Text
                    style={{
                      color: '#F87011',
                      fontSize: 17,
                      fontWeight: 'bold',
                    }}>
                    Delete
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setIsShowEdit(!isShowEdit)}>
                  <Text style={{fontSize: 15}}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    // setListFolder([...listFolder, titleFolder]),
                    setIsShowEdit(!isShowEdit), handleEditFolder();
                  }}>
                  <Text
                    style={{color: '#f20', fontSize: 17, fontWeight: 'bold'}}>
                    OK
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>

      <View>
        <FlatList
          data={listFolder}
          renderItem={renderItem}
          keyExtractor={(item, index) => index}
          numColumns={2}
        />
      </View>

      <View
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
        }}>
        <TouchableOpacity
          onPress={() => {
            setModalVisible(true);
          }}>
          <Image
            source={require('../component/images/add1.png')}
            style={styles.icon_addFolder}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MyWord;
