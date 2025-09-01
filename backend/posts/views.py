from datetime import timezone
from django.shortcuts import get_object_or_404
from rest_framework import status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView, CreateAPIView
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend # type: ignore
from rest_framework.filters import SearchFilter, OrderingFilter
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.openapi import OpenApiResponse
from rest_framework.exceptions import PermissionDenied, ValidationError
from .models import JobApplication, Post, Like, Poke, Comment
from .serializers import (
    JobApplicationListSerializer, PostSerializer, PostListSerializer, CommentSerializer,
    LikeSerializer, PokeSerializer, CommentSerializer, JobApplicationSerializer
)
from rest_framework.views import APIView
from rest_framework.generics import UpdateAPIView

class PostListCreateView(ListCreateAPIView):
    queryset = Post.objects.filter(is_active=True)
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['post_type', 'priority', 'location', 'user__account_type']
    search_fields = ['title', 'description', 'location']
    ordering_fields = ['created_at', 'priority', 'view_count']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return PostListSerializer
        return PostSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, created_by=self.request.user)

    @extend_schema(
        summary="List posts",
        description="Get paginated list of posts with filtering",
        parameters=[
            OpenApiParameter('post_type', str, description='Filter by post type'),
            OpenApiParameter('search', str, description='Search in title, description'),
        ],
        responses={200: PostListSerializer(many=True)}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        summary="Create post",
        description="Create new Job post",
        request=PostSerializer,
        responses={201: PostSerializer}
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class PostRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.filter(is_active=True)
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        obj = super().get_object()
        # Only increment view count on GET requests, not on toggle actions
        if self.request.method == 'GET':
            obj.view_count += 1
            obj.save(update_fields=['view_count'])
        return obj

    def get_permissions(self):
        if self.request.method in ['PATCH', 'DELETE']:
            return [permissions.IsAuthenticated()]
        return [IsAuthenticated()]

    def perform_update(self, serializer):
        # Only allow owner to update
        if serializer.instance.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only edit your own posts")
        serializer.save(updated_by=self.request.user)

    def perform_destroy(self, instance):
        # Only allow owner to delete
        if instance.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only delete your own posts")
        instance.is_active = False
        instance.save()

    @extend_schema(
        summary="Get post details",
        description="Retrieve post by ID",
        responses={200: PostSerializer}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        summary="Update post",
        description="Update post (owner only)",
        request=PostSerializer,
        responses={200: PostSerializer}
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)

    @extend_schema(
        summary="Delete post",
        description="Delete post (owner only)",
        responses={204: OpenApiResponse(description="Post deleted")}
    )
    def delete(self, request, *args, **kwargs):
        return super().delete(request, *args, **kwargs)

    @extend_schema(
        summary="Toggle like",
        description="Like or unlike post",
        responses={200: {"type": "object", "properties": {"liked": {"type": "boolean"}, "total_likes": {"type": "integer"}}}}
    )
    @action(detail=True, methods=['post'])
    def toggle_like(self, request, pk=None):
        post = self.get_object()
        like, created = Like.objects.get_or_create(
            user=request.user,
            post=post,
            defaults={'like': True}
        )
        if not created:
            like.like = not like.like
            like.save()

        return Response({
            'liked': like.like,
            'total_likes': post.total_likes
        })

    @extend_schema(
        summary="Toggle poke",
        description="Poke or unpoke post",
        responses={200: {"type": "object", "properties": {"poked": {"type": "boolean"}, "total_pokes": {"type": "integer"}}}}
    )
    @action(detail=True, methods=['post'])
    def toggle_poke(self, request, pk=None):
        post = self.get_object()
        poke, created = Poke.objects.get_or_create(
            user=request.user,
            post=post,
            defaults={'poke': True}
        )
        if not created:
            poke.poke = not poke.poke
            poke.save()

        return Response({
            'poked': poke.poke,
            'total_pokes': post.total_pokes
        })


class CommentListCreateView(ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['post', 'parent']
    ordering = ['-created_at']

    def get_queryset(self):
        return Comment.objects.filter(post__is_active=True)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @extend_schema(
        summary="List comments",
        description="Get comments for posts",
        parameters=[
            OpenApiParameter('post', str, description='Filter by post ID'),
            OpenApiParameter('parent', str, description='Filter by parent comment ID'),
        ],
        responses={200: CommentSerializer(many=True)}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        summary="Create comment",
        description="Add comment to post",
        request=CommentSerializer,
        responses={201: CommentSerializer}
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class CommentRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        if serializer.instance.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only edit your own comments")
        serializer.save(is_edited=True)

    def perform_destroy(self, instance):
        if instance.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only delete your own comments")
        instance.delete()

    @extend_schema(
        summary="Get comment",
        description="Retrieve comment by ID",
        responses={200: CommentSerializer}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        summary="Update comment",
        description="Update comment (owner only)",
        request=CommentSerializer,
        responses={200: CommentSerializer}
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)

    @extend_schema(
        summary="Delete comment",
        description="Delete comment (owner only)",
        responses={204: OpenApiResponse(description="Comment deleted")}
    )
    def delete(self, request, *args, **kwargs):
        return super().delete(request, *args, **kwargs)


class JobApplicationCreateView(CreateAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        if self.request.user.account_type != 'WORKER':
            raise PermissionDenied("Only workers can apply for jobs")
        job_id = self.kwargs.get('job_id')
        try:
            job = Post.objects.get(id=job_id, is_active=True)
        except Post.DoesNotExist:
            raise ValidationError("Job not found or inactive")
        if JobApplication.objects.filter(job=job, applicant=self.request.user).exists():
            raise ValidationError("You have already applied for this job")

        serializer.save(applicant=self.request.user, job=job)



class ToggleLikeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        like, created = Like.objects.get_or_create(
            user=request.user,
            post=post,
            defaults={'like': True}
        )

        if not created:
            like.like = not like.like
            like.save()

        serializer = LikeSerializer(like)
        return Response({
            'liked': like.like,
            'total_likes': post.total_likes,
            'data': serializer.data
        }, status=status.HTTP_200_OK)

class TogglePokeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        poke, created = Poke.objects.get_or_create(
            user=request.user,
            post=post,
            defaults={'poke': True}
        )

        if not created:
            poke.poke = not poke.poke
            poke.save()

        serializer = PokeSerializer(poke)
        return Response({
            'poked': poke.poke,
            'total_pokes': post.total_pokes,
            'data': serializer.data
        }, status=status.HTTP_200_OK)



class JobApplicationListView(ListCreateAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [OrderingFilter]
    ordering = ['-created_at']

    def get_queryset(self):
        job_id = self.kwargs.get('job_id')
        job = get_object_or_404(Post, id=job_id, is_active=True)

        # Only job owner can see applications
        if job.user != self.request.user:
            raise PermissionDenied("You can only view applications for your own jobs")

        return JobApplication.objects.filter(job=job)

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return JobApplicationListSerializer  # We'll create this
        return JobApplicationSerializer


class JobApplicationUpdateView(UpdateAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return JobApplication.objects.all()

    def perform_update(self, serializer):
        application = self.get_object()
        # Only job owner can update application status
        if application.job.user != self.request.user:
            raise PermissionDenied("You can only update applications for your own jobs")

        serializer.save(
            reviewed_by=self.request.user,
            reviewed_at=timezone.now()
        )
