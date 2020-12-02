import React, { Component } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, FlatList } from 'react-native';
import db from '../config'


export default class SearchScreen extends React.Component{
    constructor(){
        super();
        this.state={
            allTransactions:[],
            search:'',
            lastTransaction:null
        }
    }

    fetchModeTransactions=async()=>{
        var text=this.state.search.toUpperCase();
        var enteredText=text.split("");

        if(enteredText[0].toUpperCase()==='B'){
            const query=await db.collection("transactions").where("bookID",'==',text).startAfter(this.state.lastTransaction).limit(10).get()
            query.docs.map((doc)=>{
                this.setState({
                    allTransactions:[...this.state.allTransactions,doc.data()],
                    lastTransaction:doc
                })
            })
        }

        else if(enteredText[0].toUpperCase()==='S'){
            const query=await db.collection("transactions").where("bookID",'==',text).startAfter(this.state.lastTransaction).limit(10).get()
            query.docs.map((doc)=>{
                this.setState({
                    allTransactions:[...this.state.allTransactions,doc.data()],
                    lastTransaction:doc
                })
            })
        }

        
    }

    searchTransaction=async(text)=>{
        var enteredText=text.split("");
        var text=enteredText.toUpperCase();
        
        if(enteredText[0].toUpperCase()==='B'){
            const query=await db.collection("transactions").where("bookID",'==',text).get()
            query.docs.map((doc)=>{
                this.setState({
                    allTransactions:[...this.state.allTransactions,doc.data()],
                    lastTransaction:doc
                })
            })
        }

        else if(enteredText[0].toUpperCase()==='S'){
            const query=await db.collection("transactions").where("studentID",'==',text).get()
            query.docs.map((doc)=>{
                this.setState({
                    allTransactions:[...this.state.allTransactions,doc.data()],
                    lastTransaction:doc
                })
            })
        }

    }

    componentDidMount=async()=>{
        const query=await db.collection("transaction").limit(10).get()
        query.docs.map((doc)=>{
            this.setState({
                allTransactions:[],
                lastTransaction:doc
            })
        })
    }

    render(){
        return(
        <View style={styles.container}>
            <View style={styles.searchBar}>
                <TextInput
                style={styles.bar}
                placeholder={"Enter Book ID and Student ID"}
                onChangeText={(text)=>this.setState({search:text})}
                />
                <TouchableOpacity style={styles.searchButton}
                onPress={()=>{this.searchTransaction(this.state.search)}}>

                    <Text>Search</Text>
                </TouchableOpacity>

            </View>
            <FlatList
            data={this.state.allTransactions}
            renderItem={({item})=>(<View style={{borderBottomWidth:2}}>
                <Text>{"Book ID : " +item.bookID}</Text>
                <Text>{"Student ID : "+item.studentID}</Text>
                <Text>{"Transaction Type :"+item.transactionType}</Text>
                <Text>{"Date : "+item.date.toDate()}</Text>
                </View>)}
            keyExtractor={(item,index)=>index.toString()}
            onEndReached={this.fetchModeTransactions}
            onEndReachedThreshold={0.7}
            />
            
        </View>
        )
    }
}

const styles=StyleSheet.create({
    container:{
        flex:1,
        marginTop:20
    },
    searchBar:{
        flexDirection:"row",
        height:40,
        width:"auto",
        borderWidth:0.5,
        alignItems:"center",
        backgroundColor:'grey'
    },
    bar:{
        borderWidth:3,
        width:300,
        height:30,
        paddingLeft:10
    },
    searchButton:{
        width:50,
        height:30,
        borderWidth:1,
        alignItems:'center',
        justifyItems:'center',
        backgroundColor:'green'
    }
})