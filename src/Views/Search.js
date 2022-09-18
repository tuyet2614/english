import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  FlatList,
  TouchableOpacity,
  SectionList,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import styles from '../component/Style';
// import listVocabulary from '../Data/Data';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faHome, faMagnifyingGlass} from '@fortawesome/free-solid-svg-icons';
import {openDatabase} from 'react-native-sqlite-storage';

const db = openDatabase({
  name: 'run.db',
  location: 'Library',
  createFromLocation: '~vocabulary.db',
});

const Search = ({route, navigation}) => {
  const [filterData, setFilterData] = useState([]);
  const [search, setSearch] = useState('');
  const [listVocabulary, setListVocabulary] = useState([]);
  const [loading, setLoading] = useState(false);

  const getCategories = () => {
    setLoading(true);
    db.transaction(txn => {
      txn.executeSql(
        'SELECT * FROM vocabulary',

        [],
        (sqlTxn, res) => {
          console.log('categories retrieved successfully');
          let len = res.rows.length;

          if (len > 0) {
            let results = [];
            for (let i = 0; i < len; i++) {
              let item = res.rows.item(i);

              results.push({
                id: item.id,
                group: item.group,
                title: item.title,
                phonetic: item.phonetic,
                eMean: item.eMean,
                mean: item.mean,
                img: item.img,
                exam: item.exam,
                trans: item.trans,
              });
            }

            setListVocabulary(results);
            setFilterData(results);
          }
          setLoading(false);
        },
        error => {
          console.log('error on getting categories ' + error.message);
          setLoading(false);
        },
      );
    });
  };

  useEffect(() => {
    getCategories();
    // setFilterData(listVocabulary);
  }, []);
  const searchFilter = text => {
    if (text) {
      const newVocab = listVocabulary.filter(item => {
        const itemVocab = item.title
          ? item.title.toLowerCase()
          : ''.toLowerCase();

        const textData = text.toLowerCase();
        return itemVocab.indexOf(textData) > -1;
      });
      setFilterData(newVocab);
      setSearch(text);
    } else {
      setFilterData(listVocabulary);
      setSearch(text);
    }
  };

  return (
    <View>
      <View style={styles.Search}>
        <TextInput
          style={{flex: 1, padding: 5}}
          placeholder="Search..."
          onChangeText={text => searchFilter(text)}
          value={search}
        />
        <FontAwesomeIcon
          icon={faMagnifyingGlass}
          style={styles.icon_search}
          size={25}
        />
      </View>

      <View>
        {loading ? <ActivityIndicator size="large" color="#0000ff" /> : ''}
        <ScrollView>
          {filterData.map(item => (
            <TouchableOpacity
              style={[styles.item, {paddingLeft: 15}]}
              key={item.id}
              onPress={() => {
                navigation.navigate('DetailWord', {
                  vocabGroup: listVocabulary,
                  detail: item,
                });
              }}>
              <View>
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.group}>{item.title}</Text>
                  <Text style={styles.phonetic}>{item.phonetic}</Text>
                </View>

                <Text style={{color: '#000', fontWeight: 'bold'}}>
                  {item.mean}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default Search;
