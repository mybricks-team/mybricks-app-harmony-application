export default {
  cards: [
    {
      id: 'openRouter',
      title: '业务模块',
      required: true,
      inputs: [
        {
          id: 'open',
          title: '打开页面',
          schema: {
            type: 'object',
            properties: {
              uri: {
                type: 'string',
                description: '页面路径'
              },
              params: {
                type: 'object',
                description: '请求参数'
              }
            }
          }
        }
      ],
      outputsEditable: true,
    },
  ],
};
