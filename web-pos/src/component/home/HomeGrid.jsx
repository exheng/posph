import React from 'react'
import{ Row , Col} from "antd";

function HomeGrid({data = [] }) {
  return (
    <Row>
        {data?.map((Item, index) => (
            <Col  span={6} key={index}>
               <div style={{
                  backgroundColor: "#EEE",
                  padding:15 , margin:5  , 
                  borderRadius:5,
                  minHeight:100
                  }}>
                   <div style={{fontSize : 26, fontWeight:"bold"}}>{ Item.title}</div>
                   <div>{Item.obj?.total}</div>
               </div>
           </Col>
        ))}
    </Row>
  );
}

export default HomeGrid;