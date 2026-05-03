import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { AppRole } from '../rbac/role.enum';
import { CreateEventDto } from './dto/create-event.dto';
import { EventDto } from './dto/event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventsService } from './events.service';

@ApiTags('events')
@ApiHeader({
  name: 'x-role',
  required: true,
  description:
    'RBAC role header. Accepted values: admin | moderator | user. ' +
    'GET / POST require any valid role. PATCH requires admin or moderator. DELETE requires admin.',
  schema: { type: 'string', enum: ['admin', 'moderator', 'user'] },
})
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @Roles(AppRole.ADMIN, AppRole.MODERATOR, AppRole.USER)
  @ApiOperation({
    summary: 'List all events',
    description: 'Returns all events. Optionally filter by status query param (upcoming | past | cancelled).',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter events by status',
    example: 'upcoming',
    enum: ['upcoming', 'past', 'cancelled'],
  })
  @ApiOkResponse({ type: EventDto, isArray: true, description: 'Array of event records' })
  @ApiForbiddenResponse({ description: 'Missing or invalid x-role header' })
  findAll(@Query('status') status?: string) {
    return this.eventsService.findAll(status);
  }

  @Get(':id')
  @Roles(AppRole.ADMIN, AppRole.MODERATOR, AppRole.USER)
  @ApiOperation({
    summary: 'Get a single event by ID',
    description: 'Fetches one event by its numeric ID.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Numeric event ID' })
  @ApiOkResponse({ type: EventDto, description: 'The matching event record' })
  @ApiNotFoundResponse({ description: 'Event not found' })
  @ApiForbiddenResponse({ description: 'Missing or invalid x-role header' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.findOne(id);
  }

  @Post()
  @Roles(AppRole.ADMIN, AppRole.MODERATOR, AppRole.USER)
  @ApiOperation({
    summary: 'Create an event',
    description: 'Creates a new event linked to a community. Any authenticated role may create events.',
  })
  @ApiBody({ type: CreateEventDto, description: 'Event creation payload' })
  @ApiCreatedResponse({ type: EventDto, description: 'The newly created event' })
  @ApiForbiddenResponse({ description: 'Missing or invalid x-role header' })
  create(@Body() payload: CreateEventDto) {
    return this.eventsService.create(payload);
  }

  @Patch(':id')
  @Roles(AppRole.ADMIN, AppRole.MODERATOR)
  @ApiOperation({
    summary: 'Update an event',
    description: 'Partially updates an event (all fields optional). Requires x-role: admin or moderator.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Numeric event ID to update' })
  @ApiBody({ type: UpdateEventDto, description: 'Fields to update (all optional)' })
  @ApiOkResponse({ type: EventDto, description: 'The updated event record' })
  @ApiNotFoundResponse({ description: 'Event not found' })
  @ApiForbiddenResponse({ description: 'Only admin or moderator can update events' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateEventDto,
  ) {
    return this.eventsService.update(id, payload);
  }

  @Delete(':id')
  @Roles(AppRole.ADMIN)
  @ApiOperation({
    summary: 'Delete an event',
    description: 'Permanently deletes an event. Requires x-role: admin.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Numeric event ID to delete' })
  @ApiOkResponse({ schema: { example: { message: 'Event 2 deleted' } }, description: 'Deletion confirmation' })
  @ApiNotFoundResponse({ description: 'Event not found' })
  @ApiForbiddenResponse({ description: 'Only admin can delete events' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.remove(id);
  }
}
