import React, {useEffect, useState} from 'react';
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
// import Vocabulary from '../Data/Data';
import {launchImageLibrary} from 'react-native-image-picker';
import styles from '../component/Style';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faEdit, faVolumeHigh} from '@fortawesome/free-solid-svg-icons';
import {faTrash} from '@fortawesome/free-solid-svg-icons';
import {faImage} from '@fortawesome/free-solid-svg-icons';
import {faPen} from '@fortawesome/free-solid-svg-icons';
import listVocabService from '../service/listVocabService';
import axios from 'axios';
import Tts from 'react-native-tts';
import {openDatabase} from 'react-native-sqlite-storage';

Tts.setIgnoreSilentSwitch('ignore');

Tts.addEventListener('tts-start');
Tts.addEventListener('tts-progress');
Tts.addEventListener('tts-finish');
Tts.addEventListener('tts-cancel');
const db = openDatabase(
  {
    name: 'run.db',
    createFromLocation: '~vocabulary.db',
  },
  null,
  null,
);

const MyVocabulary = ({route, navigation}) => {
  const titleGroup = route.params.titleGroup;
  const [listVocab, setListVocab] = useState([]);
  const [title, setTitle] = useState('');
  const [phonetic, setPhonetic] = useState('');
  const [eMean, setEMean] = useState('');
  const [mean, setMean] = useState('');
  const [img, setImg] = useState(null);
  const [exam, setExam] = useState('');
  const [trans, setTrans] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [isShowEdit, setIsShowEdit] = useState(false);
  const [currentId, setCurrentId] = useState('');
  const [loading, setLoading] = useState(false);

  const showListVocab = () => {
    setLoading(true);
    listVocabService
      .getAll(titleGroup.id)
      .then(res => {
        setListVocab(res.data);

        setLoading(false);
      })
      .catch(error => {
        console.log(error);
        setLoading(false);
      });
  };

  const getPhonetic = vocabTitle => {
    setLoading(true);
    axios
      .get(`https://api.dictionaryapi.dev/api/v2/entries/en/${vocabTitle}`)
      .then(res => {
        console.log('call success');
        let pronoun = res.data[0].phonetic
          ? res.data[0].phonetic
          : res.data[0].phonetics[0].text
          ? res.data[0].phonetics[0].text
          : res.data[0].phonetics[1].text
          ? res.data[0].phonetics[1].text
          : '';
        setPhonetic(pronoun);
        setLoading(false);
      })
      .catch(error => {
        console.log(error);
        setLoading(false);
      });
  };

  const handleAddVocab = async () => {
    let data = {
      title: title,
      phonetic: phonetic,
      eMean: eMean,
      mean: mean,
      img: img,
      exam: exam,
      trans: trans,
    };
    setLoading(true);
    listVocabService
      .create(titleGroup.id, data)
      .then(res => {
        setListVocab(pre => [res.data, ...pre]);
        console.log('success fully');
        setLoading(false);
      })
      .catch(error => {
        console.log(error);
        setLoading(false);
      });
  };

  const handleDelete = currentdelete => {
    setLoading(true);
    listVocabService
      .remove(titleGroup.id, currentdelete)
      .then(res => {
        const newlistVocab = listVocab.filter(
          item => item.id !== currentdelete,
        );
        db.transaction(tx => {
          tx.executeSql(
            'UPDATE vocabulary set memory=? where id=?',
            [0, currentdelete],
            (tx, results) => {
              tx.executeSql(
                'SELECT * FROM vocabulary WHERE id=?',
                [currentdelete],
                (sqlTxn, res) => {
                  console.log('check:', res.rows.item(0));
                },
              ),
                error => {
                  console.log(error);
                };
            },
            error => {
              console.log('error on getting categories ' + error.message);
            },
          );
        });
        setListVocab(newlistVocab);

        setLoading(false);
      })
      .catch(error => {
        console.log(error);
        setLoading(false);
      });
  };

  const handleEdit = () => {
    let data = {
      title: title,
      phonetic: phonetic,
      eMean: eMean,
      mean: mean,
      img: img,
      exam: exam,
      trans: trans,
    };
    setLoading(true);
    listVocabService
      .update(titleGroup.id, currentId, data)
      .then(res => {
        setListVocab(
          listVocab.map(item =>
            item.id === currentId
              ? {
                  ...res.data,
                  title: title,
                  phonetic: phonetic,
                  eMean: eMean,
                  mean: mean,
                  img: img,
                  exam: exam,
                  trans: trans,
                }
              : item,
          ),
        );
        setLoading(false);
      })
      .catch(error => {
        console.log(error);
        setLoading(false);
      });
  };

  const selectImage = () => {
    const options = {
      noData: true,
    };
    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled photo picker');
      } else {
        if (response.assets[0].uri) {
          setImg(response.assets[0].uri);
          console.log('check: ', img);
        }
      }
    });
  };

  useEffect(() => {
    const reRender = navigation.addListener('focus', () => {
      showListVocab();
      // getCategories();
    });
    return () => {
      reRender;
    };
  }, [navigation]);

  return (
    <View style={{backgroundColor: '#ffffff', flex: 0.85}}>
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#0000ff"
          //   style={{marginTop: 200, position: 'relative', top: 50}}
        />
      ) : (
        ''
      )}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          height: 50,
          paddingHorizontal: 20,
        }}>
        <View style={{marginTop: 5}}>
          <TouchableOpacity
            onPress={() => {
              console.log('done');
              setPhonetic('');
              setModalVisible(true);
              console.log(modalVisible);
            }}>
            <Image
              source={require('../component/images/add1.png')}
              style={styles.icon_addFolder}
            />
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity>
            <Image
              source={require('../component/images/practive.png')}
              style={styles.icon_practive}
            />
          </TouchableOpacity>
        </View>
      </View>
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
              <Text style={styles.textStyle}>Add new vocabulary</Text>
              <TextInput
                style={styles.inputAdd}
                placeholder="Enter title vocabulary"
                onChangeText={text => {
                  setTitle(text);
                }}
                onEndEditing={() => getPhonetic(title)}
              />
              {loading ? (
                <ActivityIndicator
                  size="large"
                  color="#0000ff"
                  //   style={{marginTop: 200, position: 'relative', top: 50}}
                />
              ) : (
                ''
              )}
              <TextInput
                style={styles.inputAdd}
                placeholder="Enter phonetic"
                value={phonetic}
                onChangeText={text => {
                  setPhonetic(text);
                }}
              />
              <TextInput
                style={styles.inputAdd}
                placeholder="Enter english mean"
                onChangeText={text => {
                  setEMean(text);
                }}
              />
              <TextInput
                style={styles.inputAdd}
                placeholder="Enter mean"
                onChangeText={text => {
                  setMean(text);
                }}
              />
              <TextInput
                style={styles.inputAdd}
                placeholder="Enter example"
                onChangeText={text => {
                  setExam(text);
                }}
              />
              <TextInput
                style={styles.inputAdd}
                placeholder="Enter translation"
                onChangeText={text => {
                  setTrans(text);
                }}
              />
              <TouchableOpacity onPress={selectImage}>
                <FontAwesomeIcon
                  icon={faImage}
                  style={{
                    color: '#03B903',
                    marginBottom: 10,
                    alignSelf: 'center',
                  }}
                  size={30}
                />
              </TouchableOpacity>
              <View style={styles.choosen}>
                <TouchableOpacity
                  onPress={() => setModalVisible(!modalVisible)}>
                  <Text style={styles.textStyle}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(!modalVisible);
                    handleAddVocab();
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
            setModalVisible(!isShowEdit);
          }}>
          <View
            style={[
              styles.centeredView,
              {backgroundColor: 'rgba(64,64,64, 0.8)'},
            ]}>
            <View style={styles.modalView}>
              <Text style={styles.textStyle}>Edit vocabulary</Text>
              <TextInput
                style={styles.inputAdd}
                placeholder="enter title"
                defaultValue={title}
                onChangeText={text => {
                  setTitle(text);
                }}
                onEndEditing={() => getPhonetic(title)}
              />
              {loading ? (
                <ActivityIndicator
                  size="large"
                  color="#0000ff"
                  //   style={{marginTop: 200, position: 'relative', top: 50}}
                />
              ) : (
                ''
              )}
              <TextInput
                style={styles.inputAdd}
                placeholder="enter phonetic"
                defaultValue={phonetic}
                onChangeText={text => {
                  setPhonetic(text);
                }}
              />
              <TextInput
                style={styles.inputAdd}
                placeholder="enter english mean"
                defaultValue={eMean}
                onChangeText={text => {
                  setEMean(text);
                }}
              />
              <TextInput
                style={styles.inputAdd}
                placeholder="enter mean"
                defaultValue={mean}
                onChangeText={text => {
                  setMean(text);
                }}
              />

              <TextInput
                style={styles.inputAdd}
                placeholder="enter exam"
                defaultValue={exam}
                onChangeText={text => {
                  setExam(text);
                }}
              />
              <TextInput
                style={styles.inputAdd}
                placeholder="enter translate exam"
                defaultValue={trans}
                onChangeText={text => {
                  setTrans(text);
                }}
              />
              <TouchableOpacity onPress={selectImage}>
                <FontAwesomeIcon
                  icon={faImage}
                  style={{
                    color: '#03B903',
                    marginBottom: 10,
                    alignSelf: 'center',
                  }}
                  size={30}
                />
              </TouchableOpacity>
              <View style={styles.choosen}>
                <TouchableOpacity onPress={() => setIsShowEdit(!isShowEdit)}>
                  <Text style={styles.textStyle}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    // setNewVocab({ title: title, phonetic: phonetic, eMean: eMean, mean: mean, img: img, exam: exam, trans: trans })
                    // setListVocab([...listVocab, newVocab]),
                    setIsShowEdit(!isShowEdit);
                    handleEdit();
                  }}>
                  <Text style={styles.textStyle}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
      <View>
        <ScrollView>
          {listVocab.map(item => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => {
                navigation.navigate('DetailWord', {
                  vocabGroup: listVocab,
                  detail: item,
                  deleteId: item.id,
                });
              }}>
              <View style={[styles.iconVolume, {marginRight: 100}]}>
                <TouchableOpacity onPress={() => Tts.speak(item.title)}>
                  <FontAwesomeIcon
                    icon={faVolumeHigh}
                    style={{color: '#ffffff'}}
                    size={18}
                  />
                </TouchableOpacity>
              </View>
              <View style={{justifyContent: 'center', alignContent: 'center'}}>
                <Text style={styles.group}>{item.title}</Text>
                <Text style={{fontSize: 15, color: '#000'}}>
                  {item.phonetic}
                </Text>
              </View>
              <View style={{position: 'absolute', right: 20, top: 15}}>
                <TouchableOpacity
                  onPress={() => {
                    // setCurrentId(item.id),
                    handleDelete(item.id);
                  }}>
                  <View style={{flexDirection: 'row', marginBottom: 10}}>
                    <FontAwesomeIcon
                      icon={faTrash}
                      style={{color: '#f20'}}
                      size={18}
                    />
                    <Text style={{color: '#f20', marginLeft: 5}}>Delete</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setCurrentId(item.id);
                    setTitle(item.title);
                    setEMean(item.eMean);
                    setPhonetic(item.phonetic);
                    setImg(item.img);
                    setMean(item.mean);
                    setExam(item.exam);
                    setTrans(item.trans);
                    setIsShowEdit(true);
                  }}>
                  <View style={{flexDirection: 'row', marginBottom: 10}}>
                    <FontAwesomeIcon
                      icon={faPen}
                      style={{color: '#03B903'}}
                      size={18}
                    />
                    <Text style={{color: '#03B903', marginLeft: 5}}>Edit</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default MyVocabulary;
