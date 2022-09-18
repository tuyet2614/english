import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  Image,
} from 'react-native';
import styles from '../component/Style';
// import Vocabulary from '../Data/Data';
import GestureFlipView from 'react-native-gesture-flip-card';

import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faVolumeHigh} from '@fortawesome/free-solid-svg-icons';
import Tts from 'react-native-tts';
import {faStar} from '@fortawesome/free-solid-svg-icons';
import listVocabService from '../service/listVocabService';
import vocabService from '../service/VocabService';
import {openDatabase} from 'react-native-sqlite-storage';

const db = openDatabase(
  {
    name: 'run.db',
    createFromLocation: '~vocabulary.db',
  },
  null,
  null,
);

const DetailVocab = ({route, navigation}) => {
  const detail = route.params;
  const [currentWord, setCurrentWord] = useState(detail.detail);
  const [currentIndex, setCurrentIndex] = useState(
    detail.vocabGroup.indexOf(currentWord),
  );
  const [remember, setRemember] = useState(currentWord.memory);
  const [listVocab, setListVocab] = useState([]);
  const [creteTable, setCreateTable] = useState(false);
  const [isDataRemember, setIsDataRemember] = useState(0);
  const rememberList = route.params.vocabGroup;
  const [rememberId, setRememberId] = useState(0);

  // console.log(currentWord);
  console.log('remember: ', remember);
  const changeColor = () => {
    setRemember(!remember);
  };
  const onSubmitFormHandler = async () => {
    let data = {
      title: 'Remember',
      handle: true,
      score: 0,
    };

    creteTable
      ? vocabService
          .create(data)
          .then(res => {
            setListFolder(pre => [res.data, ...pre]);
            console.log('success fully');
          })
          .catch(error => console.log(error))
      : '';
  };

  const showListVocab = () => {
    listVocabService
      .getAll('50')
      .then(res => {
        setListVocab(res.data);
      })
      .catch(error => console.log(error));
  };

  const getIndexDelete = () => {
    listVocab.map(item =>
      item.realId === currentWord.id ? setIsDataRemember(item.id) : '',
    );
  };

  const rememberWord = item => {
    // setRemember(!remember);
    // updateIsRemember();

    let listTitle = [];
    if (!remember) {
      console.log();
      let data = {
        title: item.title,
        phonetic: item.phonetic,
        eMean: item.eMean,
        mean: item.mean,
        img: item.img,
        exam: item.exam,
        trans: item.trans,
        memory: 1,
        realId: item.id,
      };
      listVocab.map(vocab => listTitle.push(vocab.title));
      listTitle.includes(item.title)
        ? console.log('have already')
        : listVocabService
            .create('50', data)
            .then(res => {
              setListVocab(pre => [res.data, ...pre]);
              console.log('success fully');
            })
            .catch(error => console.log(error));
      // console.log("add")

      // console.log("add")
    }
  };

  const deleteRememberWord = currentdelete => {
    console.log('idDelete: ', currentdelete);
    let isDelete;
    console.log(listVocab);
    listVocab.map(
      item =>
        (isDelete = item.realId === currentdelete ? item.id : currentdelete),
    );
    listVocabService
      .remove('50', isDelete)
      .then(res => {
        const newlistVocab = listVocab.filter(item => item.id !== isDelete);
        setListVocab(newlistVocab);
        db.transaction(tx => {
          tx.executeSql(
            'UPDATE vocabulary set memory=? where id=?',
            [0, currentdelete.id],
            (tx, results) => {
              tx.executeSql(
                'SELECT * FROM vocabulary WHERE id=?',
                [currentdelete.id],
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
        console.log('delete successfully');
      })
      .catch(error => console.log(error));
  };

  const getWord = type => {
    if (type === 'next' && currentIndex < detail.vocabGroup.length - 1) {
      setCurrentWord(detail.vocabGroup[currentIndex + 1]);
      setCurrentIndex(currentIndex + 1);
      setRemember(detail.vocabGroup[currentIndex + 1].memory);
    } else if (type === 'pre' && currentIndex > 0) {
      setCurrentWord(detail.vocabGroup[currentIndex - 1]);
      setCurrentIndex(currentIndex - 1);
      setRemember(detail.vocabGroup[currentIndex - 1].memory);
    }
  };

  let updateIsRemember = () => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE vocabulary set memory=? where id=?',
        [!remember, currentWord.id],
        (tx, results) => {
          if (results.rowsAffected > 0) {
            tx.executeSql(
              'SELECT * FROM vocabulary WHERE id=?',
              [currentWord.id],
              (sqlTxn, res) => {
                console.log('check:', res.rows.item(0));
                // setRemember(res.rows.item(0).memory);
                if (!res.rows.item(0).memory)
                  deleteRememberWord(currentWord.id);
              },
            ),
              error => {
                console.log(error);
              };
          } else alert('Updation Failed');
        },
        error => {
          console.log('error on getting categories ' + error.message);
        },
      );
    });
  };

  useEffect(() => {
    const reRender = navigation.addListener('focus', () => {
      showListVocab();
      //   changeColor();
    });
    return () => {
      reRender;
    };
  }, []);

  const renderFront = () => {
    return (
      <View style={styles.frontStyle}>
        <View style={{position: 'absolute', right: 40, top: 30}}>
          <TouchableOpacity
            onPress={() => {
              onSubmitFormHandler();
              setRemember(!remember);
              updateIsRemember();
              // changeColor();
              rememberWord(currentWord);
            }}>
            <FontAwesomeIcon
              icon={faStar}
              style={{color: remember ? '#f20' : '#9A9796'}}
              size={30}
            />
          </TouchableOpacity>
        </View>
        <Text style={{fontSize: 30, color: '#000000', fontWeight: 'bold'}}>
          {currentWord.title}
        </Text>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginVertical: 20,
          }}>
          <Text style={{fontSize: 18, color: '#000000', fontWeight: 'bold'}}>
            {currentWord.phonetic}
          </Text>
          <TouchableOpacity
            style={styles.iconVolume}
            onPress={() => {
              Tts.speak(currentWord.title);
            }}>
            <FontAwesomeIcon
              icon={faVolumeHigh}
              style={{color: '#ffffff'}}
              size={18}
            />
          </TouchableOpacity>
        </View>

        <View style={{justifyContent: 'center', width: 350}}>
          <Text style={{fontSize: 20, color: '#000000', textAlign: 'center'}}>
            {' '}
            {currentWord.eMean}
          </Text>
        </View>
        <View>
          <Image
            source={{uri: currentWord.img}}
            style={{width: 220, height: 220, marginTop: 20}}
          />
        </View>
      </View>
    );
  };

  const renderBack = () => {
    return (
      <View style={styles.backStyle}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text style={{fontSize: 30, color: '#000000', fontWeight: 'bold'}}>
            {currentWord.title}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginVertical: 20,
          }}>
          <Text style={{fontSize: 18, color: '#000000', fontWeight: 'bold'}}>
            {currentWord.phonetic}
          </Text>
          <TouchableOpacity
            style={styles.iconVolume}
            onPress={() => {
              Tts.speak(currentWord.title);
            }}>
            <FontAwesomeIcon
              icon={faVolumeHigh}
              style={{color: '#ffffff'}}
              size={18}
            />
          </TouchableOpacity>
        </View>
        <View>
          <Text style={{fontSize: 25, color: '#000000', paddingHorizontal: 10}}>
            {currentWord.mean}
          </Text>
        </View>

        <View style={{marginTop: 40, width: 330}}>
          <View style={{paddingHorizontal: 15}}>
            <View style={{flexDirection: 'row', marginBottom: 20}}>
              {currentWord.exam && (
                <TouchableOpacity
                  style={{alignSelf: 'center', marginRight: 5}}
                  onPress={() => {
                    Tts.speak(currentWord.exam), {rate: 0.5};
                  }}>
                  <FontAwesomeIcon
                    icon={faVolumeHigh}
                    style={{color: '#0357C2'}}
                    size={20}
                  />
                </TouchableOpacity>
              )}

              <Text
                style={{
                  fontSize: 18,
                  color: '#7400BB',
                  fontWeight: 'bold',
                  marginLeft: 5,
                }}>
                {currentWord.exam}
              </Text>
            </View>

            <Text
              style={{
                fontSize: 18,
                color: '#F0843E',
                fontWeight: 'bold',
                marginLeft: 25,
              }}>
              {currentWord.trans}
            </Text>
          </View>
        </View>
      </View>
    );
  };
  return (
    <ImageBackground
      source={require('../component/images/book2.jpeg')}
      resizeMode="cover"
      style={styles.image}>
      <View
        style={{
          flex: 1,
          // justifyContent: "center",
          alignItems: 'center',
          paddingTop: 35,
          textAlign: 'center',
        }}>
        <GestureFlipView width={300} height={500}>
          {renderFront()}
          {renderBack()}
        </GestureFlipView>

        <View style={styles.choosen}>
          {currentIndex === 0 ? (
            ''
          ) : (
            <View style={styles.button}>
              <TouchableOpacity onPress={() => getWord('pre')}>
                <Text style={styles.status}>Back</Text>
                <Image
                  source={require('../component/images/back1.png')}
                  style={styles.icon_choose}
                />
              </TouchableOpacity>
            </View>
          )}

          {currentIndex === detail.vocabGroup.length - 1 ? (
            ''
          ) : (
            <View style={styles.button}>
              <TouchableOpacity onPress={() => getWord('next')}>
                <Text style={styles.status}>Next</Text>
                <Image
                  source={require('../component/images/next.png')}
                  style={styles.icon_choose}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </ImageBackground>
  );
};

export default DetailVocab;
