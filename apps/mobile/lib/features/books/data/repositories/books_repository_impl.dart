import '../../domain/entities/books_entity.dart';
import '../../domain/repositories/books_repository.dart';
import '../datasources/books_remote_datasource.dart';
import '../models/books_dto.dart';

class BookRepositoryImpl implements BookRepository {
  final BookRemoteDataSource _remoteDataSource;

  BookRepositoryImpl(this._remoteDataSource);

  @override
  Future<List<Book>> getAll() async {
    return await _remoteDataSource.getAll();
  }

  @override
  Future<Book?> getById(String id) async {
    return await _remoteDataSource.getById(id);
  }

  @override
  Future<void> add(Book item) async {
    final dto = BookDto(
      id: item.id,
      title: item.title,
      author: item.author,
      coverUrl: item.coverUrl,
      pdfUrl: item.pdfUrl,
      pages: item.pages,
      description: item.description,
    );
    await _remoteDataSource.add(dto);
  }

  @override
  Future<void> update(Book item) async {
    final dto = BookDto(
      id: item.id,
      title: item.title,
      author: item.author,
      coverUrl: item.coverUrl,
      pdfUrl: item.pdfUrl,
      pages: item.pages,
      description: item.description,
    );
    await _remoteDataSource.update(dto);
  }

  @override
  Future<void> delete(String id) async {
    await _remoteDataSource.delete(id);
  }
}
