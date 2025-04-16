import { PureComponent } from 'react'

import { withAuth0 } from '@auth0/auth0-react'
import { Col, Container, Label, Row } from 'reactstrap'

import { Loader } from 'shared/components'
import { GetCurrentUser } from 'shared/services/account'

import moment from 'moment'
import { withTranslation } from 'react-i18next'

class UserProfileContainer extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            isLoading: true,
            isError: false,
            currentUser: {
                userId: '',
                name: '',
                email: '',
                nickname: '',
                picture: '',
                authProvider: '',
                token: '',
                settings: {
                    workMode: false,
                    customMessage: '',
                },
            },
        }
    }

    async componentDidMount() {
        await this.loadUserProfileFromAPI()
    }

    loadUserProfileFromAPI = async () => {
        try {
            const response = await GetCurrentUser()

            if (response) {
                this.setState({ currentUser: response.data, isLoading: false })
            }
        } catch (error) {
            this.setState({ isError: true })
            console.log(error)
        }
    }

    render() {
        const { isLoading, currentUser } = this.state
        const { user } = this.props.auth0
        const { t } = this.props

        return (
            <Container>
                <Row className="mt-4 mb-4">
                    <Col xs={12} md={6}>
                        <h1>{t('title')}</h1>
                    </Col>
                </Row>

                {isLoading ? (
                    <Loader />
                ) : currentUser ? (
                    <>
                        <Row>
                            <Col xs="6" md="6">
                                <div className="card user-profile-infos text-center p-4">
                                    <img
                                        className="user-profile-picture"
                                        src={currentUser.picture}
                                        alt="UserPicture"
                                    />

                                    <span className="mt-4">
                                        <h5>
                                            {t('profile.connectionStatus', {
                                                name: currentUser.name,
                                            })}
                                        </h5>
                                        <h6>
                                            {t('profile.updatedAt', {
                                                datetime: moment(
                                                    user.updated_at
                                                ).format('DD/MM/YY HH:mm:ss'),
                                            })}
                                        </h6>

                                        <h6>
                                            <small>
                                                {user.email_verified ? (
                                                    <span
                                                        style={{
                                                            color: 'green',
                                                        }}
                                                    >
                                                        <i class="fas fa-check-circle me-2" />
                                                        {t(
                                                            'profile.email.isVerified'
                                                        )}
                                                    </span>
                                                ) : (
                                                    <span
                                                        style={{ color: 'red' }}
                                                    >
                                                        <i class="fas fa-exclamation-circle me-2" />
                                                        {t(
                                                            'profile.email.isNotVerified'
                                                        )}
                                                    </span>
                                                )}
                                            </small>
                                        </h6>
                                    </span>
                                </div>
                            </Col>

                            <Col xs="6" md="6">
                                <div className="card p-4">
                                    <form id="profile-form">
                                        <Row>
                                            <Col xs="12" md="6">
                                                <Label
                                                    for="user-email"
                                                    className="form-label"
                                                >
                                                    {t('user.email.label')}
                                                </Label>

                                                <input
                                                    className="form-control"
                                                    name="email"
                                                    id="email"
                                                    value={currentUser.email}
                                                    disabled
                                                />
                                            </Col>

                                            <Col xs="12" md="6">
                                                <Label
                                                    for="user-nickname"
                                                    className="form-label"
                                                >
                                                    {t('user.nickname.label')}
                                                </Label>

                                                <input
                                                    className="form-control"
                                                    name="name"
                                                    id="name"
                                                    value={currentUser.nickname}
                                                    disabled
                                                />
                                            </Col>
                                        </Row>

                                        <Row className="mt-4">
                                            <Col xs="12" md="12">
                                                <Label
                                                    for="user-provider-id"
                                                    className="form-label"
                                                >
                                                    {t('user.userId.label')}
                                                </Label>

                                                <input
                                                    className="form-control"
                                                    name="userId"
                                                    id="userId"
                                                    value={currentUser.user_id}
                                                    disabled
                                                />
                                            </Col>
                                        </Row>
                                    </form>
                                </div>
                            </Col>
                        </Row>
                    </>
                ) : (
                    <div
                        className="alert alert-danger"
                        role="alert"
                        style={{ marginTop: '50px' }}
                    >
                        {t('error.unableToFetchUserDetails')}
                    </div>
                )}
            </Container>
        )
    }
}

export default withAuth0(
    withTranslation('UserProfileContainer')(UserProfileContainer)
)
