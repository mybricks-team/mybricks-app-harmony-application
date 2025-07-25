export default {
  title: '系统总线',
  cards: [
    // {
    //   id: 'openRouter',
    //   title: '业务模块',
    //   required: true,
    //   inputs: [
    //     {
    //       id: 'open',
    //       title: '打开页面',
    //       schema: {
    //         type: 'object',
    //         properties: {
    //           uri: {
    //             type: 'string',
    //             description: '页面路径'
    //           },
    //           params: {
    //             type: 'object',
    //             description: '请求参数'
    //           }
    //         }
    //       }
    //     }
    //   ],
    //   outputsEditable: true,
    // },
    {
      id: 'bus-getUser',
      title: '获取登录用户',
      type: 'bus',
      inputs: [
        {
          id: 'call',
          title: '调用',
          schema: {
            type: 'follow',
            description: '参数'
          }
        }
      ],
      outputs: [
        {
          id: 'then',
          title: '结果',
          schema: {
            type: 'object',
            description: '返回的用户信息',
            properties: {
              "uid": {
                "title": "用户ID",
                "description": "用户唯一标识",
                "type": "string"
              },
              "username": {
                "title": "用户名",
                "description": "登录用户名",
                "type": "string"
              },
              "nickname": {
                "title": "昵称",
                "description": "用户昵称",
                "type": "string"
              },
              "phone": {
                "title": "手机号",
                "description": "用户绑定的手机号",
                "type": "string"
              },
              "avatar": {
                "title": "头像",
                "description": "用户头像URL",
                "type": "string"
              },
              "gender": {
                "title": "性别",
                "description": "用户性别：0=未知，1=男，2=女",
                "type": "number"
              },
              "token": {
                "title": "登录凭证",
                "description": "登录凭证",
                "type": "string"
              },
              "email": {
                "title": "邮箱",
                "description": "用户绑定的邮箱地址",
                "type": "string"
              }
            }
          }
        },
        {
          id: 'catch',
          title: '发生错误',
          schema: {
            type: 'string',
            description: '错误信息'
          }
        }
      ],
    }
  ],
};
