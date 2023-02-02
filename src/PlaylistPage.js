import { FlatList, Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import Colors from './constants/Colors'
import Feather from 'react-native-vector-icons/Feather';
import { Display, formatName, getDuration } from './Ultils';
import axios from 'axios';

const PlaylistPage = ({ medias, mediaName }) => {
    const [searchQuery, setSearchQuery] = useState("")

    const playlistRef = useRef();

    useEffect(() => {
        if(medias){
            playlistRef.current.scrollToOffset({ offset: medias.findIndex(m => m.name === mediaName) * 60, animated: true })
        }
    }, [mediaName])

    const chooseMedia = index => () => {
        setSearchQuery("");
        Keyboard.dismiss();
        axios.get(`chooseMedia/${index}`)
    }

    const renderMedias = ({ item, index }) => (
        <Pressable style={styles.item} onPress={chooseMedia(index)}>
            <View style={[styles.selectedItem, { backgroundColor: mediaName === item.name ? "#727272" : "transparent" }]} />
            <Text style={styles.mediaName}>{formatName(item.name)}</Text>
            <Text style={styles.mediaDuration}>{getDuration(item.duration)}</Text>
        </Pressable>
    )

    return (
        <View style={styles.container}>
            <View style={styles.searchBox}>
                <View style={styles.searchBackground} />
                <Feather style={styles.searchIcon} name="search" />
                <TextInput style={styles.searchInput} value={searchQuery} onChangeText={text => setSearchQuery(text)} />
            </View>
            <FlatList
                ref={playlistRef}
                style={{ flex: 1, marginTop: 5 }}
                data={medias?.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))}
                renderItem={renderMedias}
                keyExtractor={item => item.name}
                keyboardDismissMode="on-drag"
                keyboardShouldPersistTaps="always"
            />
        </View>
    )
}

export default PlaylistPage

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchBox: {
        marginTop: 30,
        width: Display.width,
        height: 30,
        alignItems: "center",
        flexDirection: "row",
        paddingHorizontal: 10
    },
    searchBackground: {
        width: "100%",
        height: "100%",
        position: "absolute",
        backgroundColor: "#cfcfcf",
        left: 10,
        borderRadius: 24,
        opacity: 0.3
    },
    searchIcon: {
        fontSize: 18,
        color: Colors.WHITE,
        marginLeft: 10
    },
    searchInput: {
        flex: 1,
        color: Colors.WHITE,
        fontSize: 14,
        padding: 0,
        marginLeft: 5
    },
    item: {
        width: Display.width,
        height: 60,
        paddingHorizontal: 15,
        justifyContent: "center",
    },
    mediaName: {
        fontSize: 14,
        color: "white"
    },
    mediaDuration: {
        fontSize: 12,
        color: "#bfbfbf",
        marginTop: 5
    },
    selectedItem: {
        position: "absolute",
        width: Display.width,
        height: "100%",
        opacity: 0.45
    },
})