import { Controller, Get, Post, Body, HttpException, HttpStatus, Param } from '@nestjs/common';
import {
  EnglishConversationService,
  ConversationScene,
  ConversationState,
  ChatRequest,
} from './english-conversation.service';

@Controller('english-conversation')
export class EnglishConversationController {
  constructor(private readonly service: EnglishConversationService) {}

  @Get('scenes')
  getScenes(): ConversationScene[] {
    return this.service.getScenes();
  }

  @Get('scenes/:id')
  getSceneById(@Param('id') id: string): ConversationScene {
    const scene = this.service.getSceneById(id);
    if (!scene) {
      throw new HttpException('场景不存在', HttpStatus.NOT_FOUND);
    }
    return scene;
  }

  @Post('new-conversation')
  createNewConversation(@Body() body: { sceneId: string }): ConversationState {
    if (!body.sceneId) {
      throw new HttpException('请选择场景', HttpStatus.BAD_REQUEST);
    }
    try {
      return this.service.createNewConversation(body.sceneId);
    } catch (e: any) {
      throw new HttpException(e.message || '创建对话失败', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('chat')
  async chat(@Body() body: ChatRequest): Promise<ConversationState> {
    if (!body.userMessage || !body.userMessage.trim()) {
      throw new HttpException('请输入消息', HttpStatus.BAD_REQUEST);
    }
    if (!body.currentState) {
      throw new HttpException('对话状态丢失，请重新开始', HttpStatus.BAD_REQUEST);
    }
    try {
      return await this.service.chat(body);
    } catch (e: any) {
      throw new HttpException(e.message || '发送消息失败', HttpStatus.BAD_REQUEST);
    }
  }
}
