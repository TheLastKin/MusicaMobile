import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Display, getTotalDuration } from './Ultils';
import axios from 'axios';

const PlaylistsPage = ({ currentPlaylistName, playlists }) => {

    
    const changePlaylist = index => () => {
        axios.get(`changePlaylist/${index}`)
    }

    const renderPlaylists = ({ item, index }) => (
        <Pressable style={styles.item} onPress={changePlaylist(index)}>
            <View style={[styles.selectedItem, { backgroundColor: currentPlaylistName === item.name ? "#727272" : "transparent" }]} />
            <Text style={styles.playlistName}>{item.name}</Text>
            <Text style={styles.playlistInfo}>{item.medias.length} songs - {getTotalDuration(item.medias)}</Text>
        </Pressable>
    )

    return (
        <View style={styles.container}>
            <FlatList
                style={{ flex: 1, marginTop: 35 }}
                data={playlists}
                renderItem={renderPlaylists}
                keyExtractor={item => item.name}
            />
        </View>
    )
}

export default PlaylistsPage

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    item: {
        width: Display.width,
        height: 60,
        paddingHorizontal: 15,
        justifyContent: "center",
    },
    selectedItem: {
        position: "absolute",
        width: Display.width,
        height: "100%",
        opacity: 0.45
    },
    playlistName: {
        fontSize: 14,
        color: "white"
    },
    playlistInfo: {
        fontSize: 12,
        color: "#bfbfbf",
        marginTop: 5
    },
})